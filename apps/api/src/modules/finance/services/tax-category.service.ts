import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TaxCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: { code: string; name: string; description?: string; isActive?: boolean }) {
    return this.prisma.taxCategory.create({
      data: {
        organizationId,
        code: data.code,
        name: data.name,
        description: data.description,
        isActive: data.isActive ?? true,
      },
    });
  }

  async findAll(organizationId: string, params?: { skip?: number; take?: number; search?: string }) {
    const where: Prisma.TaxCategoryWhereInput = { organizationId };
    if (params?.search) {
      where.OR = [
        { code: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.taxCategory.findMany({
        where,
        skip: params?.skip,
        take: params?.take ?? 100,
        include: { taxDetails: { orderBy: { effectiveFrom: 'desc' }, take: 1 } },
        orderBy: { code: 'asc' },
      }),
      this.prisma.taxCategory.count({ where }),
    ]);
    return { data: items, total, page: params?.skip ? Math.floor(params.skip / (params.take ?? 10)) + 1 : 1, pageSize: params?.take ?? 10 };
  }

  async findOne(id: string) {
    const item = await this.prisma.taxCategory.findUnique({
      where: { id },
      include: { taxDetails: { orderBy: { effectiveFrom: 'desc' } } },
    });
    if (!item) throw new NotFoundException('Tax category not found');
    return item;
  }

  async update(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    await this.findOne(id);
    return this.prisma.taxCategory.update({
      where: { id },
      data: { name: data.name, description: data.description, isActive: data.isActive },
    });
  }

  async addRate(taxCategoryId: string, data: { rate: number; effectiveFrom: Date; effectiveTo?: Date; description?: string }) {
    return this.prisma.taxDetail.create({
      data: {
        taxCategoryId,
        rate: data.rate,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        description: data.description,
      },
    });
  }
}
