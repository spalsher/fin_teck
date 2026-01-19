import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

@Injectable()
export class ProductionOrderService {
  constructor(
    private prisma: PrismaService,
    private documentSequenceService: DocumentSequenceService,
  ) {}

  async create(
    branchId: string,
    data: {
      bomId: string;
      plannedQty: number;
      plannedStart: Date;
      plannedEnd: Date;
      warehouseId: string;
      status?: string;
    },
    userId: string,
  ) {
    // Validate BOM
    const bom = await this.prisma.bOM.findUnique({
      where: { id: data.bomId },
    });

    if (!bom) {
      throw new NotFoundException('BOM not found');
    }

    if (bom.status !== 'APPROVED') {
      throw new BadRequestException('Can only create production orders from approved BOMs');
    }

    // Validate warehouse
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id: data.warehouseId, branchId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    // Generate order number
    const orderNo = await this.documentSequenceService.getNextNumber(
      branchId,
      'MANUFACTURING',
      'PRODUCTION_ORDER',
    );

    return this.prisma.productionOrder.create({
      data: {
        branchId,
        orderNo,
        bomId: data.bomId,
        plannedQty: data.plannedQty,
        producedQty: 0,
        plannedStart: data.plannedStart,
        plannedEnd: data.plannedEnd,
        warehouseId: data.warehouseId,
        status: data.status || 'PLANNED',
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        bom: {
          include: {
            finishedItem: {
              select: {
                id: true,
                itemCode: true,
                name: true,
              },
            },
          },
        },
        warehouse: {
          select: {
            id: true,
            warehouseCode: true,
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
      status?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    const where: Prisma.ProductionOrderWhereInput = {
      branchId,
    };

    if (params?.search) {
      where.OR = [
        { orderNo: { contains: params.search, mode: 'insensitive' } },
        { bom: { name: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.fromDate || params?.toDate) {
      where.plannedStart = {};
      if (params.fromDate) {
        where.plannedStart.gte = params.fromDate;
      }
      if (params.toDate) {
        where.plannedStart.lte = params.toDate;
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.productionOrder.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          bom: {
            include: {
              finishedItem: {
                select: {
                  id: true,
                  itemCode: true,
                  name: true,
                },
              },
            },
          },
          warehouse: {
            select: {
              id: true,
              warehouseCode: true,
              name: true,
            },
          },
          _count: {
            select: {
              qcInspections: true,
            },
          },
        },
        orderBy: { plannedStart: 'desc' },
      }),
      this.prisma.productionOrder.count({ where }),
    ]);

    return {
      data: orders,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.productionOrder.findUnique({
      where: { id },
      include: {
        bom: {
          include: {
            finishedItem: true,
            bomLines: {
              include: {
                componentItem: true,
              },
            },
          },
        },
        warehouse: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        qcInspections: {
          select: {
            id: true,
            inspectionNo: true,
            inspectionDate: true,
            result: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Production order not found');
    }

    return order;
  }

  async start(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.status !== 'PLANNED') {
      throw new BadRequestException('Only planned orders can be started');
    }

    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        actualStart: new Date(),
        updatedBy: userId,
      },
    });
  }

  async recordProduction(id: string, quantity: number, userId: string) {
    const order = await this.findOne(id);

    if (order.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Can only record production for in-progress orders');
    }

    const newProducedQty = Number(order.producedQty) + quantity;

    if (newProducedQty > Number(order.plannedQty)) {
      throw new BadRequestException('Produced quantity exceeds planned quantity');
    }

    const newStatus = newProducedQty >= Number(order.plannedQty) ? 'COMPLETED' : 'IN_PROGRESS';

    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        producedQty: newProducedQty,
        status: newStatus,
        actualEnd: newStatus === 'COMPLETED' ? new Date() : order.actualEnd,
        updatedBy: userId,
      },
    });
  }

  async cancel(id: string, userId: string) {
    const order = await this.findOne(id);

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel completed or already cancelled orders');
    }

    return this.prisma.productionOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const order = await this.findOne(id);

    if (order.status !== 'PLANNED') {
      throw new BadRequestException('Only planned orders can be deleted');
    }

    await this.prisma.productionOrder.delete({
      where: { id },
    });

    return { message: 'Production order deleted successfully' };
  }
}
