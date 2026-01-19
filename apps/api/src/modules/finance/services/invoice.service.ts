import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

@Injectable()
export class InvoiceService {
  constructor(
    private prisma: PrismaService,
    private documentSequenceService: DocumentSequenceService,
  ) {}

  async create(
    branchId: string,
    data: {
      customerId: string;
      invoiceDate: Date;
      dueDate: Date;
      invoiceType: string;
      externalRef?: string;
      notes?: string;
      lines: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate?: number;
        itemId?: string;
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

    // Generate invoice number
    const invoiceNo = await this.documentSequenceService.getNextNumber(branchId, 'FINANCE', 'INVOICE');

    // Calculate totals
    const lines = data.lines.map((line, index) => {
      const taxRate = line.taxRate || 0;
      const lineTotal = line.quantity * line.unitPrice;

      return {
        lineNo: index + 1,
        description: line.description,
        quantity: line.quantity,
        uom: 'EA',
        unitPrice: line.unitPrice,
        discount: 0,
        taxRate: taxRate,
        lineTotal,
        itemId: line.itemId,
        createdBy: userId,
        updatedBy: userId,
      };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const taxAmount = lines.reduce((sum, line) => sum + (line.lineTotal * line.taxRate / 100), 0);
    const totalAmount = subtotal + taxAmount;

    return this.prisma.invoice.create({
      data: {
        branchId,
        customerId: data.customerId,
        invoiceNo,
        invoiceDate: data.invoiceDate,
        dueDate: data.dueDate,
        invoiceType: data.invoiceType,
        externalRef: data.externalRef,
        notes: data.notes,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceDue: totalAmount,
        status: 'DRAFT',
        createdBy: userId,
        updatedBy: userId,
        invoiceLines: {
          create: lines,
        },
      },
      include: {
        invoiceLines: {
          include: {
            item: true,
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
    const where: Prisma.InvoiceWhereInput = {
      branchId,
    };

    if (params?.search) {
      where.OR = [
        { invoiceNo: { contains: params.search, mode: 'insensitive' } },
        { externalRef: { contains: params.search, mode: 'insensitive' } },
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
      where.invoiceDate = {};
      if (params.fromDate) {
        where.invoiceDate.gte = params.fromDate;
      }
      if (params.toDate) {
        where.invoiceDate.lte = params.toDate;
      }
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
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
              invoiceLines: true,
            },
          },
        },
        orderBy: { invoiceDate: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        invoiceLines: {
          include: {
            item: true,
          },
        },
        customer: {
          include: {
            customerContacts: true,
          },
        },
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

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async post(id: string, userId: string) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be posted');
    }

    if (!invoice.invoiceLines || invoice.invoiceLines.length === 0) {
      throw new BadRequestException('Invoice must have at least one line');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'POSTED',
        updatedBy: userId,
      },
      include: {
        invoiceLines: true,
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
    const invoice = await this.findOne(id);

    if (invoice.status === 'VOID') {
      throw new BadRequestException('Invoice is already voided');
    }

    if (invoice.status === 'PAID') {
      throw new BadRequestException('Cannot void a paid invoice');
    }

    // Check if there are any payments
    const receiptCount = await this.prisma.receiptAllocation.count({
      where: { invoiceId: id },
    });

    if (receiptCount > 0) {
      throw new BadRequestException('Cannot void invoice with payments');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: 'VOID',
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const invoice = await this.findOne(id);

    if (invoice.status !== 'DRAFT') {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { message: 'Invoice deleted successfully' };
  }
}
