import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BomService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: {
      bomCode: string;
      name: string;
      finishedItemId: string;
      outputQty: number;
      outputUom: string;
      status?: string;
      lines: Array<{
        componentItemId: string;
        quantity: number;
        uom: string;
        wastagePercent?: number;
      }>;
    },
    userId: string,
  ) {
    // Check if BOM code already exists
    const existing = await this.prisma.bOM.findFirst({
      where: {
        organizationId,
        bomCode: data.bomCode,
      },
    });

    if (existing) {
      throw new ConflictException(`BOM code ${data.bomCode} already exists`);
    }

    // Validate finished item
    const finishedItem = await this.prisma.item.findFirst({
      where: { id: data.finishedItemId, organizationId, deletedAt: null },
    });

    if (!finishedItem) {
      throw new NotFoundException('Finished item not found');
    }

    // Validate component items
    for (const line of data.lines) {
      const component = await this.prisma.item.findFirst({
        where: { id: line.componentItemId, organizationId, deletedAt: null },
      });

      if (!component) {
        throw new NotFoundException(`Component item ${line.componentItemId} not found`);
      }
    }

    return this.prisma.bOM.create({
      data: {
        organizationId,
        bomCode: data.bomCode,
        name: data.name,
        finishedItemId: data.finishedItemId,
        outputQty: data.outputQty,
        outputUom: data.outputUom,
        status: data.status || 'DRAFT',
        version: 1,
        isActive: true,
        createdBy: userId,
        updatedBy: userId,
      bomLines: {
        create: data.lines.map((line, index) => ({
          sequence: index + 1,
          componentItemId: line.componentItemId,
          quantity: line.quantity,
          uom: line.uom,
          isOptional: false,
          notes: line.wastagePercent ? `Wastage: ${line.wastagePercent}%` : null,
        })),
      },
      },
      include: {
        finishedItem: {
          select: {
            id: true,
            itemCode: true,
            name: true,
          },
        },
        bomLines: {
          include: {
            componentItem: {
              select: {
                id: true,
                itemCode: true,
                name: true,
              },
            },
          },
          orderBy: { sequence: 'asc' },
        },
      },
    });
  }

  async findAll(
    organizationId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      status?: string;
      isActive?: boolean;
    },
  ) {
    const where: Prisma.BOMWhereInput = {
      organizationId,
    };

    if (params?.search) {
      where.OR = [
        { bomCode: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [boms, total] = await Promise.all([
      this.prisma.bOM.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          finishedItem: {
            select: {
              id: true,
              itemCode: true,
              name: true,
            },
          },
          _count: {
            select: {
              bomLines: true,
              productionOrders: true,
            },
          },
        },
        orderBy: { bomCode: 'asc' },
      }),
      this.prisma.bOM.count({ where }),
    ]);

    return {
      data: boms,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string, organizationId: string) {
    const bom = await this.prisma.bOM.findFirst({
      where: { id, organizationId },
      include: {
        finishedItem: true,
        bomLines: {
          include: {
            componentItem: true,
          },
          orderBy: { sequence: 'asc' },
        },
        _count: {
          select: {
            productionOrders: true,
          },
        },
      },
    });

    if (!bom) {
      throw new NotFoundException('BOM not found');
    }

    return bom;
  }

  async approve(id: string, organizationId: string, userId: string) {
    const bom = await this.findOne(id, organizationId);

    if (bom.status !== 'DRAFT') {
      throw new BadRequestException('Only draft BOMs can be approved');
    }

    return this.prisma.bOM.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedBy: userId,
      },
    });
  }

  async deactivate(id: string, organizationId: string, userId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.bOM.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: userId,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const bom = await this.prisma.bOM.findFirst({
      where: { id, organizationId },
    });

    if (!bom) {
      throw new NotFoundException('BOM not found');
    }

    if (bom.status !== 'DRAFT') {
      throw new BadRequestException('Only draft BOMs can be deleted');
    }

    // Check if BOM is being used in any production orders
    const usage = await this.prisma.productionOrder.count({
      where: { bomId: id },
    });

    if (usage > 0) {
      throw new ConflictException('Cannot delete BOM with production orders');
    }

    await this.prisma.bOM.delete({
      where: { id },
    });

    return { message: 'BOM deleted successfully' };
  }
}
