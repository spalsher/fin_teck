import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import {
  CreateServiceOfferingDto,
  UpdateServiceOfferingDto,
  PaginationParams,
} from '@iteck/shared';

@Injectable()
export class ServiceOfferingService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createDto: CreateServiceOfferingDto) {
    const existing = await this.prisma.serviceOffering.findFirst({
      where: {
        organizationId,
        code: createDto.code,
      },
    });

    if (existing) {
      throw new ConflictException('Service offering code already exists');
    }

    return this.prisma.serviceOffering.create({
      data: {
        ...createDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, params: PaginationParams) {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.serviceOffering.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.serviceOffering.count({
        where: { organizationId },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const serviceOffering = await this.prisma.serviceOffering.findUnique({
      where: { id },
    });

    if (!serviceOffering) {
      throw new NotFoundException('Service offering not found');
    }

    return serviceOffering;
  }

  async update(id: string, updateDto: UpdateServiceOfferingDto) {
    const serviceOffering = await this.prisma.serviceOffering.findUnique({
      where: { id },
    });

    if (!serviceOffering) {
      throw new NotFoundException('Service offering not found');
    }

    return this.prisma.serviceOffering.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const serviceOffering = await this.prisma.serviceOffering.findUnique({
      where: { id },
    });

    if (!serviceOffering) {
      throw new NotFoundException('Service offering not found');
    }

    return this.prisma.serviceOffering.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
