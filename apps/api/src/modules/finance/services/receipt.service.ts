import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private documentSequenceService: DocumentSequenceService,
  ) {}

  async create(
    branchId: string,
    data: {
      customerId: string;
      receiptDate: Date;
      amount: number;
      paymentMethod: string;
      reference?: string;
      notes?: string;
      allocations: Array<{
        invoiceId: string;
        amount: number;
      }>;
    },
    userId: string,
  ) {
    // Validate customer
    const customer = await this.prisma.customer.findFirst({
      where: { id: data.customerId, deletedAt: null },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Validate allocations
    if (data.allocations.length === 0) {
      throw new BadRequestException('Receipt must have at least one allocation');
    }

    const totalAllocated = data.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    if (totalAllocated > data.amount) {
      throw new BadRequestException('Total allocated amount cannot exceed receipt amount');
    }

    // Validate invoices and check available amounts
    for (const allocation of data.allocations) {
      const invoice = await this.prisma.invoice.findFirst({
        where: {
          id: allocation.invoiceId,
          customerId: data.customerId,
          status: { in: ['POSTED', 'PARTIALLY_PAID'] },
        },
      });

      if (!invoice) {
        throw new NotFoundException(`Invoice ${allocation.invoiceId} not found or cannot be paid`);
      }

      // Get already allocated amount
      const allocated = await this.prisma.receiptAllocation.aggregate({
        where: {
          invoiceId: allocation.invoiceId,
          receipt: { status: 'POSTED' },
        },
        _sum: {
          amount: true,
        },
      });

      const alreadyAllocated = Number(allocated._sum.amount || 0);
      const availableAmount = Number(invoice.totalAmount) - alreadyAllocated;

      if (allocation.amount > availableAmount) {
        throw new BadRequestException(
          `Allocation amount for invoice ${invoice.invoiceNo} exceeds available amount`,
        );
      }
    }

    // Generate receipt number
    const receiptNo = await this.documentSequenceService.getNextNumber(branchId, 'FINANCE', 'RECEIPT');

    return this.prisma.receipt.create({
      data: {
        branchId,
        customerId: data.customerId,
        receiptNo,
        receiptDate: data.receiptDate,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        referenceNo: data.reference,
        notes: data.notes,
        status: 'DRAFT',
        createdBy: userId,
        updatedBy: userId,
        receiptAllocations: {
          create: data.allocations,
        },
      },
      include: {
        receiptAllocations: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNo: true,
                totalAmount: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            customerCode: true,
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
      customerId?: string;
      status?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    const where: Prisma.ReceiptWhereInput = {
      branchId,
    };

    if (params?.search) {
      where.OR = [
        { receiptNo: { contains: params.search, mode: 'insensitive' } },
        { referenceNo: { contains: params.search, mode: 'insensitive' } },
        { customer: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params?.customerId) {
      where.customerId = params.customerId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.fromDate || params?.toDate) {
      where.receiptDate = {};
      if (params.fromDate) {
        where.receiptDate.gte = params.fromDate;
      }
      if (params.toDate) {
        where.receiptDate.lte = params.toDate;
      }
    }

    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          customer: {
            select: {
              id: true,
              customerCode: true,
              name: true,
            },
          },
          _count: {
            select: {
              receiptAllocations: true,
            },
          },
        },
        orderBy: { receiptDate: 'desc' },
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return {
      data: receipts,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        receiptAllocations: {
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNo: true,
                invoiceDate: true,
                totalAmount: true,
                status: true,
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            customerCode: true,
            name: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    return receipt;
  }

  async post(id: string, userId: string) {
    const receipt = await this.findOne(id);

    if (receipt.status !== 'DRAFT') {
      throw new BadRequestException('Only draft receipts can be posted');
    }

    if (!receipt.receiptAllocations || receipt.receiptAllocations.length === 0) {
      throw new BadRequestException('Receipt must have at least one allocation');
    }

    // Update invoice statuses
    for (const allocation of receipt.receiptAllocations) {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: allocation.invoiceId },
      });

      if (!invoice) continue;

      // Get total allocated amount including this receipt
      const allocated = await this.prisma.receiptAllocation.aggregate({
        where: {
          invoiceId: allocation.invoiceId,
        },
        _sum: {
          amount: true,
        },
      });

      const totalAllocated = Number(allocated._sum.amount || 0) + Number(allocation.amount);
      const newStatus =
        totalAllocated >= Number(invoice.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';

      await this.prisma.invoice.update({
        where: { id: allocation.invoiceId },
        data: { status: newStatus },
      });
    }

    return this.prisma.receipt.update({
      where: { id },
      data: {
        status: 'POSTED',
        updatedBy: userId,
      },
      include: {
        receiptAllocations: {
          include: {
            invoice: true,
          },
        },
        customer: {
          select: {
            id: true,
            customerCode: true,
            name: true,
          },
        },
      },
    });
  }

  async void(id: string, userId: string) {
    const receipt = await this.findOne(id);

    if (receipt.status === 'VOID') {
      throw new BadRequestException('Receipt is already voided');
    }

    // If receipt was posted, update invoice statuses
    if (receipt.status === 'POSTED') {
      for (const allocation of receipt.receiptAllocations) {
        const invoice = await this.prisma.invoice.findUnique({
          where: { id: allocation.invoiceId },
        });

        if (!invoice) continue;

        // Recalculate allocated amount without this receipt
        const allocated = await this.prisma.receiptAllocation.aggregate({
          where: {
            invoiceId: allocation.invoiceId,
            receiptId: { not: id },
            receipt: { status: 'POSTED' },
          },
          _sum: {
            amount: true,
          },
        });

        const totalAllocated = allocated._sum.amount || 0;
        const newStatus =
          totalAllocated === 0
            ? 'POSTED'
            : totalAllocated >= invoice.totalAmount
            ? 'PAID'
            : 'PARTIALLY_PAID';

        await this.prisma.invoice.update({
          where: { id: allocation.invoiceId },
          data: { status: newStatus },
        });
      }
    }

    return this.prisma.receipt.update({
      where: { id },
      data: {
        status: 'VOID',
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const receipt = await this.findOne(id);

    if (receipt.status !== 'DRAFT') {
      throw new BadRequestException('Only draft receipts can be deleted');
    }

    await this.prisma.receipt.delete({
      where: { id },
    });

    return { message: 'Receipt deleted successfully' };
  }
}
