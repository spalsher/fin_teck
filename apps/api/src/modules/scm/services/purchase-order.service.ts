import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

@Injectable()
export class PurchaseOrderService {
  constructor(
    private prisma: PrismaService,
    private documentSequenceService: DocumentSequenceService,
  ) {}

  async create(
    branchId: string,
    data: {
      vendorId: string;
      orderDate: Date;
      expectedDate?: Date;
      notes?: string;
      lines: Array<{
        itemId: string;
        quantity: number;
        unitPrice: number;
      }>;
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

    if (data.lines.length === 0) {
      throw new BadRequestException('Purchase order must have at least one line');
    }

    // Calculate total
    const totalAmount = data.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    );

    // Generate order number
    const orderNo = await this.documentSequenceService.getNextNumber(branchId, 'SCM', 'PO');

    return this.prisma.purchaseOrder.create({
      data: {
        branchId,
        vendorId: data.vendorId,
        orderNo,
        orderDate: data.orderDate,
        expectedDate: data.expectedDate,
        totalAmount,
        status: 'DRAFT',
        notes: data.notes,
        createdBy: userId,
        updatedBy: userId,
        poLines: {
          create: data.lines.map((line, index) => ({
            lineNo: index + 1,
            itemId: line.itemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.quantity * line.unitPrice,
          })),
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            vendorCode: true,
            name: true,
          },
        },
        poLines: {
          include: {
            item: {
              select: {
                id: true,
                itemCode: true,
                name: true,
                uom: true,
              },
            },
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
    const where: Prisma.PurchaseOrderWhereInput = {
      branchId,
    };

    if (params?.search) {
      where.OR = [
        { orderNo: { contains: params.search, mode: 'insensitive' } },
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
      where.orderDate = {};
      if (params.fromDate) {
        where.orderDate.gte = params.fromDate;
      }
      if (params.toDate) {
        where.orderDate.lte = params.toDate;
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
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
          _count: {
            select: {
              poLines: true,
              goodsReceipts: true,
            },
          },
        },
        orderBy: { orderDate: 'desc' },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        poLines: {
          include: {
            item: true,
          },
          orderBy: { lineNo: 'asc' },
        },
        goodsReceipts: {
          select: {
            id: true,
            grnNo: true,
            receiptDate: true,
            status: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Purchase order not found');
    }

    return order;
  }

  async approve(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.status !== 'DRAFT') {
      throw new BadRequestException('Only draft orders can be approved');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedBy: userId,
      },
      include: {
        vendor: true,
        poLines: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  async cancel(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.status === 'CLOSED' || order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel closed or already cancelled order');
    }

    // Check if has goods receipts
    const receiptsCount = await this.prisma.goodsReceipt.count({
      where: { poId: id },
    });

    if (receiptsCount > 0) {
      throw new BadRequestException('Cannot cancel order with goods receipts');
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const order = await this.findOne(id);

    if (order.status !== 'DRAFT') {
      throw new BadRequestException('Only draft orders can be deleted');
    }

    await this.prisma.purchaseOrder.delete({
      where: { id },
    });

    return { message: 'Purchase order deleted successfully' };
  }
}
