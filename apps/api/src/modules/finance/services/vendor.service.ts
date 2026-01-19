import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VendorService {
  constructor(private prisma: PrismaService) {}

  async create(
    branchId: string,
    data: {
      vendorCode: string;
      name: string;
      taxId?: string;
      address: any;
      phone?: string;
      email?: string;
      paymentTermDays?: number;
      isActive?: boolean;
    },
    userId: string,
  ) {
    // Check if vendor code already exists
    const existing = await this.prisma.vendor.findFirst({
      where: {
        branchId,
        vendorCode: data.vendorCode,
      },
    });

    if (existing) {
      throw new ConflictException(`Vendor with code ${data.vendorCode} already exists`);
    }

    return this.prisma.vendor.create({
      data: {
        branchId,
        vendorCode: data.vendorCode,
        name: data.name,
        taxId: data.taxId,
        address: data.address,
        phone: data.phone,
        email: data.email,
        paymentTermDays: data.paymentTermDays || 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAll(
    branchId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      isActive?: boolean;
    },
  ) {
    const where: Prisma.VendorWhereInput = {
      branchId,
      deletedAt: null,
    };

    if (params?.search) {
      where.OR = [
        { vendorCode: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { taxId: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [vendors, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          _count: {
            select: {
              bills: true,
              purchaseOrders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      data: vendors,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, deletedAt: null },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            bills: true,
            purchaseOrders: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async update(
    id: string,
    data: {
      name?: string;
      taxId?: string;
      address?: any;
      phone?: string;
      email?: string;
      paymentTermDays?: number;
      isActive?: boolean;
    },
    userId: string,
  ) {
    await this.findOne(id);

    return this.prisma.vendor.update({
      where: { id },
      data: {
        name: data.name,
        taxId: data.taxId,
        address: data.address,
        phone: data.phone,
        email: data.email,
        paymentTermDays: data.paymentTermDays,
        isActive: data.isActive,
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    // Check if vendor has any transactions
    const transactionCount = await this.prisma.bill.count({
      where: { vendorId: id },
    });

    if (transactionCount > 0) {
      throw new ConflictException('Cannot delete vendor with existing transactions');
    }

    // Soft delete
    await this.prisma.vendor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Vendor deleted successfully' };
  }

  async getBalance(vendorId: string) {
    const vendor = await this.findOne(vendorId);

    const bills = await this.prisma.bill.aggregate({
      where: {
        vendorId,
        status: { in: ['POSTED', 'PARTIALLY_PAID'] },
      },
      _sum: {
        balanceDue: true,
      },
    });

    const balance = Number(bills._sum.balanceDue || 0);

    return {
      vendorId,
      vendorName: vendor.name,
      balance,
    };
  }
}
