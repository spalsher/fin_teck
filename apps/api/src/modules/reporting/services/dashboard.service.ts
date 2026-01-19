import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getFinanceDashboard(organizationId: string, branchId?: string, dateRange?: DateRange) {
    const where: any = {
      branch: { organizationId },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    if (dateRange) {
      where.createdAt = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      };
    }

    // Revenue metrics
    const [invoices, receipts, bills] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { ...where, status: 'POSTED' },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.receipt.aggregate({
        where: { ...where, status: 'POSTED' },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.bill.aggregate({
        where: { ...where, status: 'POSTED' },
        _sum: { totalAmount: true },
        _count: true,
      }),
    ]);

    // Outstanding receivables - calculated from unpaid invoices
    const outstandingReceivables = await this.prisma.invoice.aggregate({
      where: { ...where, status: 'POSTED' },
      _sum: { totalAmount: true },
    });

    // Outstanding payables - calculated from unpaid bills
    const outstandingPayables = await this.prisma.bill.aggregate({
      where: { ...where, status: 'POSTED' },
      _sum: { totalAmount: true },
    });

    const receivablesTotal = outstandingReceivables._sum?.totalAmount?.toNumber() || 0;
    const receiptsTotal = receipts._sum?.amount?.toNumber() || 0;
    const payablesTotal = outstandingPayables._sum?.totalAmount?.toNumber() || 0;

    return {
      revenue: {
        totalInvoiced: invoices._sum?.totalAmount?.toNumber() || 0,
        totalCollected: receiptsTotal,
        invoiceCount: invoices._count,
        receiptCount: receipts._count,
      },
      expenses: {
        totalBills: bills._sum?.totalAmount?.toNumber() || 0,
        billCount: bills._count,
      },
      outstanding: {
        receivables: receivablesTotal - receiptsTotal,
        payables: payablesTotal,
      },
    };
  }

  async getSCMDashboard(organizationId: string, branchId?: string) {
    // Inventory metrics
    const items = await this.prisma.item.count({
      where: {
        organizationId,
        isActive: true,
      },
    });

    // Purchase Orders
    const [poTotal, poApproved, poCancelled] = await Promise.all([
      this.prisma.purchaseOrder.count({
        where: {
          branch: { organizationId },
        },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          branch: { organizationId },
          status: 'APPROVED',
        },
      }),
      this.prisma.purchaseOrder.count({
        where: {
          branch: { organizationId },
          status: 'CANCELLED',
        },
      }),
    ]);

    // Warehouses
    const warehouses = await this.prisma.warehouse.count({
      where: {
        branch: { organizationId },
        isActive: true,
      },
    });

    return {
      inventory: {
        totalItems: items,
        warehouses,
      },
      purchaseOrders: {
        total: poTotal,
        approved: poApproved,
        cancelled: poCancelled,
        pending: poTotal - poApproved - poCancelled,
      },
    };
  }

  async getAssetDashboard(organizationId: string, branchId?: string) {
    const where: any = {
      branch: { organizationId },
    };

    if (branchId) {
      where.branchId = branchId;
    }

    // Asset metrics
    const [assets, totalValue, totalDepreciation] = await Promise.all([
      this.prisma.asset.count({
        where: { ...where, status: 'ACTIVE' },
      }),
      this.prisma.asset.aggregate({
        where: { ...where, status: 'ACTIVE' },
        _sum: { acquisitionCost: true },
      }),
      this.prisma.asset.aggregate({
        where: { ...where, status: 'ACTIVE' },
        _sum: { accumulatedDepreciation: true },
      }),
    ]);

    const acquisitionTotal = totalValue._sum?.acquisitionCost?.toNumber() || 0;
    const depreciationTotal = totalDepreciation._sum?.accumulatedDepreciation?.toNumber() || 0;
    const currentValue = acquisitionTotal - depreciationTotal;

    // By category
    const byCategory = await this.prisma.asset.groupBy({
      by: ['categoryId'],
      where: { ...where, status: 'ACTIVE' },
      _count: true,
      _sum: {
        acquisitionCost: true,
      },
    });

    return {
      assets: {
        total: assets,
        totalValue: acquisitionTotal,
        currentValue,
        depreciation: depreciationTotal,
      },
      byCategory: byCategory.map((cat) => ({
        categoryId: cat.categoryId,
        count: cat._count,
        value: cat._sum?.acquisitionCost?.toNumber() || 0,
      })),
    };
  }

  async getHRMSDashboard(organizationId: string, branchId?: string) {
    const where: any = {
      branch: { organizationId },
      status: 'ACTIVE',
    };

    if (branchId) {
      where.branchId = branchId;
    }

    // Employee metrics
    const [employees, byDepartment] = await Promise.all([
      this.prisma.employee.count({
        where,
      }),
      this.prisma.employee.groupBy({
        by: ['departmentId'],
        where,
        _count: true,
      }),
    ]);

    return {
      employees: {
        total: employees,
        byDepartment: byDepartment.map((dept) => ({
          departmentId: dept.departmentId,
          count: dept._count,
        })),
      },
    };
  }

  async getManufacturingDashboard(organizationId: string, branchId?: string) {
    // BOM uses organizationId directly, not through branch
    const bomWhere: any = {
      organizationId,
    };

    // Production Order uses branch relation
    const productionOrderWhere: any = {
      branch: { organizationId },
    };

    if (branchId) {
      productionOrderWhere.branchId = branchId;
    }

    // BOM metrics
    const [totalBOMs, approvedBOMs] = await Promise.all([
      this.prisma.bOM.count({
        where: { ...bomWhere, isActive: true },
      }),
      this.prisma.bOM.count({
        where: { ...bomWhere, isActive: true, status: 'APPROVED' },
      }),
    ]);

    // Production orders
    const [totalOrders, inProgress, completed] = await Promise.all([
      this.prisma.productionOrder.count({
        where: productionOrderWhere,
      }),
      this.prisma.productionOrder.count({
        where: { ...productionOrderWhere, status: 'IN_PROGRESS' },
      }),
      this.prisma.productionOrder.count({
        where: { ...productionOrderWhere, status: 'COMPLETED' },
      }),
    ]);

    return {
      boms: {
        total: totalBOMs,
        approved: approvedBOMs,
      },
      productionOrders: {
        total: totalOrders,
        inProgress,
        completed,
        pending: totalOrders - inProgress - completed,
      },
    };
  }

  async getOverallDashboard(organizationId: string, branchId?: string, dateRange?: DateRange) {
    try {

      const finance = await this.getFinanceDashboard(organizationId, branchId, dateRange).catch(e => {
        throw e;
      });
      
      const scm = await this.getSCMDashboard(organizationId, branchId).catch(e => {
        throw e;
      });
      
      const assets = await this.getAssetDashboard(organizationId, branchId).catch(e => {
        throw e;
      });
      
      const hrms = await this.getHRMSDashboard(organizationId, branchId).catch(e => {
        throw e;
      });
      
      const manufacturing = await this.getManufacturingDashboard(organizationId, branchId).catch(e => {
        throw e;
      });


      return {
        finance,
        scm,
        assets,
        hrms,
        manufacturing,
      };
    } catch (error) {
      throw error;
    }
  }
}
