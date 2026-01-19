import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ItemService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: {
      itemCode: string;
      name: string;
      description?: string;
      categoryId?: string;
      itemType: string;
      uom: string;
      unitCost: number;
      reorderLevel?: number;
      reorderQty?: number;
      isActive?: boolean;
      isHarnessComponent?: boolean;
    },
    userId: string,
  ) {
    // Check if item code already exists
    const existing = await this.prisma.item.findFirst({
      where: {
        organizationId,
        itemCode: data.itemCode,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(`Item code ${data.itemCode} already exists`);
    }

    return this.prisma.item.create({
      data: {
        organizationId,
        itemCode: data.itemCode,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        itemType: data.itemType,
        uom: data.uom,
        unitCost: data.unitCost,
        reorderLevel: data.reorderLevel || 0,
        reorderQty: data.reorderQty || 0,
        isActive: data.isActive !== false,
        isHarnessComponent: data.isHarnessComponent || false,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
          },
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
      itemType?: string;
      categoryId?: string;
      isActive?: boolean;
      isHarnessComponent?: boolean;
    },
  ) {
    const where: Prisma.ItemWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (params?.search) {
      where.OR = [
        { itemCode: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.itemType) {
      where.itemType = params.itemType;
    }

    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    if (params?.isHarnessComponent !== undefined) {
      where.isHarnessComponent = params.isHarnessComponent;
    }

    const [items, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { itemCode: 'asc' },
      }),
      this.prisma.item.count({ where }),
    ]);

    return {
      data: items,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string, organizationId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        category: true,
        _count: {
          select: {
            stockLedgers: true,
            invoiceLines: true,
            poLines: true,
          },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      description?: string;
      categoryId?: string;
      uom?: string;
      unitCost?: number;
      reorderLevel?: number;
      reorderQty?: number;
      isActive?: boolean;
      isHarnessComponent?: boolean;
    },
    userId: string,
  ) {
    await this.findOne(id, organizationId);

    return this.prisma.item.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        uom: data.uom,
        unitCost: data.unitCost,
        reorderLevel: data.reorderLevel,
        reorderQty: data.reorderQty,
        isActive: data.isActive,
        isHarnessComponent: data.isHarnessComponent,
        updatedBy: userId,
      },
      include: {
        category: true,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const item = await this.findOne(id, organizationId);

    // Check if has transactions
    if (
      item._count.stockLedgers > 0 ||
      item._count.invoiceLines > 0 ||
      item._count.poLines > 0
    ) {
      throw new ConflictException('Cannot delete item with existing transactions');
    }

    // Soft delete
    await this.prisma.item.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Item deleted successfully' };
  }

  async getStockLevels(itemId: string, organizationId: string) {
    await this.findOne(itemId, organizationId);

    const stockByWarehouse = await this.prisma.stockLedger.groupBy({
      by: ['warehouseId'],
      where: {
        itemId,
      },
      _sum: {
        balanceQty: true,
      },
    });

    const warehouseIds = stockByWarehouse.map((s) => s.warehouseId);
    const warehouses = await this.prisma.warehouse.findMany({
      where: { id: { in: warehouseIds } },
      select: { id: true, name: true, warehouseCode: true },
    });

    const result = stockByWarehouse.map((stock) => ({
      warehouse: warehouses.find((w) => w.id === stock.warehouseId),
      quantity: Number(stock._sum?.balanceQty || 0),
    }));

    return result;
  }
}
