import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class DesignationService {
  constructor(private prisma: PrismaService) {}

  async create(organizationId: string, data: any) {
    // Check if code already exists
    const existing = await this.prisma.designation.findUnique({
      where: { organizationId_code: { organizationId, code: data.code } },
    });

    if (existing) {
      throw new ConflictException('Designation code already exists');
    }

    return this.prisma.designation.create({
      data: {
        ...data,
        organizationId,
      },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  async findAll(organizationId: string, filters?: any) {
    const where: any = { organizationId };

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { title: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.level !== undefined) {
      where.level = parseInt(filters.level);
    }

    const [data, total] = await Promise.all([
      this.prisma.designation.findMany({
        where,
        include: {
          _count: {
            select: { employees: true },
          },
        },
        orderBy: [{ level: 'asc' }, { code: 'asc' }],
        skip: filters?.skip || 0,
        take: filters?.take || 50,
      }),
      this.prisma.designation.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor((filters?.skip || 0) / (filters?.take || 50)) + 1,
      pageSize: filters?.take || 50,
    };
  }

  async findOne(id: string, organizationId: string) {
    const designation = await this.prisma.designation.findFirst({
      where: { id, organizationId },
      include: {
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: { name: true },
            },
          },
          take: 50,
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    return designation;
  }

  async update(id: string, organizationId: string, data: any) {
    const designation = await this.prisma.designation.findFirst({
      where: { id, organizationId },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    // If updating code, check for conflicts
    if (data.code && data.code !== designation.code) {
      const existing = await this.prisma.designation.findUnique({
        where: { organizationId_code: { organizationId, code: data.code } },
      });

      if (existing) {
        throw new ConflictException('Designation code already exists');
      }
    }

    return this.prisma.designation.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const designation = await this.prisma.designation.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { employees: true },
        },
      },
    });

    if (!designation) {
      throw new NotFoundException('Designation not found');
    }

    if (designation._count.employees > 0) {
      throw new ConflictException('Cannot delete designation assigned to employees');
    }

    return this.prisma.designation.delete({ where: { id } });
  }

  async getLevels(organizationId: string) {
    const designations = await this.prisma.designation.findMany({
      where: { organizationId, isActive: true },
      select: {
        level: true,
        _count: {
          select: { employees: true },
        },
      },
      orderBy: { level: 'asc' },
      distinct: ['level'],
    });

    return designations.map((d) => ({
      level: d.level,
      employeeCount: d._count.employees,
    }));
  }
}
