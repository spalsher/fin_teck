import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

@Injectable()
export class BillService {
  constructor(
    private prisma: PrismaService,
    private documentSequenceService: DocumentSequenceService,
  ) {}

  async create(
    branchId: string,
    data: {
      vendorId: string;
      billDate: Date;
      dueDate: Date;
      totalAmount: number;
    },
    userId: string,
  ) {
    // Validate vendor
    const vendor = await this.prisma.vendor.findFirst({
      where: { id: data.vendorId, deletedAt: null },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    // Generate bill number
    const billNo = await this.documentSequenceService.getNextNumber(branchId, 'FINANCE', 'BILL');

    return this.prisma.bill.create({
      data: {
        branchId,
        vendorId: data.vendorId,
        billNo,
        billDate: data.billDate,
        dueDate: data.dueDate,
        totalAmount: data.totalAmount,
        paidAmount: 0,
        balanceDue: data.totalAmount,
        status: 'DRAFT',
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            vendorCode: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    branchId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      vendorId?: string;
      status?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    const where: Prisma.BillWhereInput = {
      branchId,
    };

    if (params?.search) {
      where.OR = [
        { billNo: { contains: params.search, mode: 'insensitive' } },
        { vendor: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params?.vendorId) {
      where.vendorId = params.vendorId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.fromDate || params?.toDate) {
      where.billDate = {};
      if (params.fromDate) {
        where.billDate.gte = params.fromDate;
      }
      if (params.toDate) {
        where.billDate.lte = params.toDate;
      }
    }

    const [bills, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          vendor: {
            select: {
              id: true,
              vendorCode: true,
              name: true,
            },
          },
        },
        orderBy: { billDate: 'desc' },
      }),
      this.prisma.bill.count({ where }),
    ]);

    return {
      data: bills,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        vendor: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
      },
    });

    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

    return bill;
  }

  async update(
    id: string,
    data: {
      billDate?: Date;
      dueDate?: Date;
      totalAmount?: number;
    },
    userId: string,
  ) {
    const bill = await this.findOne(id);

    if (bill.status !== 'DRAFT') {
      throw new BadRequestException('Only draft bills can be updated');
    }

    const updateData: Prisma.BillUpdateInput = {
      billDate: data.billDate,
      dueDate: data.dueDate,
      updatedBy: userId,
    };

    if (data.totalAmount !== undefined) {
      updateData.totalAmount = data.totalAmount;
      updateData.balanceDue = data.totalAmount - Number(bill.paidAmount);
    }

    return this.prisma.bill.update({
      where: { id },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            vendorCode: true,
            name: true,
          },
        },
      },
    });
  }

  async post(id: string, userId: string) {
    const bill = await this.findOne(id);

    if (bill.status !== 'DRAFT') {
      throw new BadRequestException('Only draft bills can be posted');
    }

    return this.prisma.bill.update({
      where: { id },
      data: {
        status: 'POSTED',
        updatedBy: userId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            vendorCode: true,
            name: true,
          },
        },
      },
    });
  }

  async void(id: string, userId: string) {
    const bill = await this.findOne(id);

    if (bill.status === 'VOID') {
      throw new BadRequestException('Bill is already voided');
    }

    if (bill.status === 'PAID') {
      throw new BadRequestException('Cannot void a paid bill');
    }

    if (Number(bill.paidAmount) > 0) {
      throw new BadRequestException('Cannot void bill with payments');
    }

    return this.prisma.bill.update({
      where: { id },
      data: {
        status: 'VOID',
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const bill = await this.findOne(id);

    if (bill.status !== 'DRAFT') {
      throw new BadRequestException('Only draft bills can be deleted');
    }

    await this.prisma.bill.delete({
      where: { id },
    });

    return { message: 'Bill deleted successfully' };
  }

  async recordPayment(
    id: string,
    data: {
      amount: number;
      paymentDate: Date;
    },
    userId: string,
  ) {
    const bill = await this.findOne(id);

    if (bill.status !== 'POSTED' && bill.status !== 'PARTIALLY_PAID') {
      throw new BadRequestException('Can only record payment for posted bills');
    }

    const currentPaid = Number(bill.paidAmount);
    const newPaidAmount = currentPaid + data.amount;
    const newBalanceDue = Number(bill.totalAmount) - newPaidAmount;

    if (newBalanceDue < 0) {
      throw new BadRequestException('Payment amount exceeds bill balance');
    }

    const newStatus = newBalanceDue === 0 ? 'PAID' : 'PARTIALLY_PAID';

    return this.prisma.bill.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        balanceDue: newBalanceDue,
        status: newStatus,
        updatedBy: userId,
      },
      include: {
        vendor: {
          select: {
            id: true,
            vendorCode: true,
            name: true,
          },
        },
      },
    });
  }
}
