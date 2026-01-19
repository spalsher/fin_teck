import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssetService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    branchId: string,
    data: {
      assetCode: string;
      name: string;
      description?: string;
      categoryId: string;
      acquisitionDate: Date;
      acquisitionCost: number;
      depreciationMethodId: string;
      usefulLife: number;
      salvageValue: number;
      status?: string;
    },
    userId: string,
  ) {
    // Check if asset code already exists
    const existing = await this.prisma.asset.findFirst({
      where: {
        organizationId,
        assetCode: data.assetCode,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(`Asset code ${data.assetCode} already exists`);
    }

    // Validate category and depreciation method
    const [category, depMethod] = await Promise.all([
      this.prisma.assetCategory.findUnique({ where: { id: data.categoryId } }),
      this.prisma.depreciationMethod.findUnique({ where: { id: data.depreciationMethodId } }),
    ]);

    if (!category) {
      throw new NotFoundException('Asset category not found');
    }

    if (!depMethod) {
      throw new NotFoundException('Depreciation method not found');
    }

    // Calculate initial net book value
    const netBookValue = data.acquisitionCost;

    return this.prisma.asset.create({
      data: {
        organizationId,
        branchId,
        assetCode: data.assetCode,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        acquisitionDate: data.acquisitionDate,
        acquisitionCost: data.acquisitionCost,
        depreciationMethodId: data.depreciationMethodId,
        usefulLife: data.usefulLife,
        salvageValue: data.salvageValue,
        accumulatedDepreciation: 0,
        netBookValue,
        status: data.status || 'ACTIVE',
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
        depreciationMethod: {
          select: {
            id: true,
            name: true,
            description: true,
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
  }

  async findAll(
    organizationId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      categoryId?: string;
      branchId?: string;
      status?: string;
    },
  ) {
    const where: Prisma.AssetWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (params?.search) {
      where.OR = [
        { assetCode: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params?.branchId) {
      where.branchId = params.branchId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
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
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { assetCode: 'asc' },
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      data: assets,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string, organizationId: string) {
    const asset = await this.prisma.asset.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        category: true,
        depreciationMethod: true,
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

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return asset;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      name?: string;
      description?: string;
      status?: string;
      usefulLife?: number;
      salvageValue?: number;
    },
    userId: string,
  ) {
    await this.findOne(id, organizationId);

    return this.prisma.asset.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        usefulLife: data.usefulLife,
        salvageValue: data.salvageValue,
        updatedBy: userId,
      },
      include: {
        category: true,
        depreciationMethod: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async recordDepreciation(
    id: string,
    organizationId: string,
    amount: number,
    userId: string,
  ) {
    const asset = await this.findOne(id, organizationId);

    if (asset.status !== 'ACTIVE') {
      throw new BadRequestException('Can only depreciate active assets');
    }

    const newAccumulatedDepreciation = Number(asset.accumulatedDepreciation) + amount;
    const newNetBookValue = Number(asset.acquisitionCost) - newAccumulatedDepreciation;

    if (newNetBookValue < Number(asset.salvageValue)) {
      throw new BadRequestException('Depreciation would reduce net book value below salvage value');
    }

    return this.prisma.asset.update({
      where: { id },
      data: {
        accumulatedDepreciation: newAccumulatedDepreciation,
        netBookValue: newNetBookValue,
        updatedBy: userId,
      },
    });
  }

  async dispose(id: string, organizationId: string, userId: string) {
    const asset = await this.findOne(id, organizationId);

    if (asset.status === 'DISPOSED') {
      throw new BadRequestException('Asset is already disposed');
    }

    return this.prisma.asset.update({
      where: { id },
      data: {
        status: 'DISPOSED',
        updatedBy: userId,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const asset = await this.findOne(id, organizationId);

    if (asset.status !== 'DRAFT') {
      throw new BadRequestException('Only draft assets can be deleted');
    }

    // Soft delete
    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Asset deleted successfully' };
  }

  async getSummary(organizationId: string) {
    const summary = await this.prisma.asset.aggregate({
      where: {
        organizationId,
        deletedAt: null,
      },
      _sum: {
        acquisitionCost: true,
        accumulatedDepreciation: true,
        netBookValue: true,
      },
      _count: {
        id: true,
      },
    });

    const statusBreakdown = await this.prisma.asset.groupBy({
      by: ['status'],
      where: {
        organizationId,
        deletedAt: null,
      },
      _count: {
        id: true,
      },
    });

    return {
      totalAssets: summary._count.id,
      totalAcquisitionCost: Number(summary._sum.acquisitionCost || 0),
      totalAccumulatedDepreciation: Number(summary._sum.accumulatedDepreciation || 0),
      totalNetBookValue: Number(summary._sum.netBookValue || 0),
      statusBreakdown,
    };
  }
}
