import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateBranchDto, UpdateBranchDto, PaginationParams } from '@iteck/shared';

@Injectable()
export class BranchService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, createDto: CreateBranchDto, userId: string) {
    const existingBranch = await this.prisma.branch.findFirst({
      where: {
        organizationId,
        code: createDto.code,
      },
    });

    if (existingBranch) {
      throw new ConflictException('Branch code already exists');
    }

    return this.prisma.branch.create({
      data: {
        ...createDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string, params: PaginationParams) {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = params;
    const skip = (page - 1) * limit;

    const [branches, total] = await Promise.all([
      this.prisma.branch.findMany({
        where: { organizationId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.branch.count({
        where: { organizationId },
      }),
    ]);

    return {
      data: branches,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return branch;
  }

  async update(id: string, updateDto: UpdateBranchDto, userId: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    return this.prisma.branch.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    if (branch.isHeadOffice) {
      throw new ConflictException('Cannot delete head office branch');
    }

    return this.prisma.branch.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}
