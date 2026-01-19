import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async create(
    branchId: string,
    data: {
      warehouseCode: string;
      name: string;
      address: any;
      isActive?: boolean;
    },
  ) {
    // Check if warehouse code already exists
    const existing = await this.prisma.warehouse.findFirst({
      where: {
        branchId,
        warehouseCode: data.warehouseCode,
      },
    });

    if (existing) {
      throw new ConflictException(`Warehouse code ${data.warehouseCode} already exists`);
    }

    return this.prisma.warehouse.create({
      data: {
        branchId,
        warehouseCode: data.warehouseCode,
        name: data.name,
        address: data.address,
        isActive: data.isActive !== false,
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
    const where: Prisma.WarehouseWhereInput = {
      branchId,
    };

    if (params?.search) {
      where.OR = [
        { warehouseCode: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [warehouses, total] = await Promise.all([
      this.prisma.warehouse.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          _count: {
            select: {
              stockLedgers: true,
              goodsReceipts: true,
            },
          },
        },
        orderBy: { warehouseCode: 'asc' },
      }),
      this.prisma.warehouse.count({ where }),
    ]);

    return {
      data: warehouses,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string, branchId: string) {
    const warehouse = await this.prisma.warehouse.findFirst({
      where: { id, branchId },
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
            stockLedgers: true,
            goodsReceipts: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }

    return warehouse;
  }

  async update(
    id: string,
    branchId: string,
    data: {
      name?: string;
      address?: any;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id, branchId);

    return this.prisma.warehouse.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string, branchId: string) {
    const warehouse = await this.findOne(id, branchId);

    // Check if has transactions
    if (warehouse._count.stockLedgers > 0 || warehouse._count.goodsReceipts > 0) {
      throw new ConflictException('Cannot delete warehouse with existing transactions');
    }

    await this.prisma.warehouse.delete({
      where: { id },
    });

    return { message: 'Warehouse deleted successfully' };
  }
}
