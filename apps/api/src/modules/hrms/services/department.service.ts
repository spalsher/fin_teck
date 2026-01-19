import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DocumentSequenceService } from '../../../modules/core/services/document-sequence.service';

@Injectable()
export class DepartmentService {
  constructor(
    private prisma: PrismaService,
    private documentSequence: DocumentSequenceService,
  ) {}

  async create(organizationId: string, data: any, userId: string) {
    // Check if code already exists
    const existing = await this.prisma.department.findUnique({
      where: { organizationId_code: { organizationId, code: data.code } },
    });

    if (existing) {
      throw new ConflictException('Department code already exists');
    }

    return this.prisma.department.create({
      data: {
        ...data,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        parent: true,
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
          take: 10,
        },
      },
    });
  }

  async findAll(organizationId: string, filters?: any) {
    const where: any = { organizationId };

    if (filters?.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        include: {
          parent: {
            select: { id: true, name: true, code: true },
          },
          _count: {
            select: {
              employees: true,
              children: true,
            },
          },
        },
        orderBy: { code: 'asc' },
        skip: filters?.skip || 0,
        take: filters?.take || 50,
      }),
      this.prisma.department.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor((filters?.skip || 0) / (filters?.take || 50)) + 1,
      pageSize: filters?.take || 50,
    };
  }

  async findOne(id: string, organizationId: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, organizationId },
      include: {
        parent: true,
        children: {
          select: {
            id: true,
            code: true,
            name: true,
            _count: {
              select: { employees: true },
            },
          },
        },
        employees: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            designation: {
              select: { title: true },
            },
          },
          take: 50,
        },
        _count: {
          select: {
            employees: true,
            children: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, organizationId: string, data: any, userId: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, organizationId },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // If updating code, check for conflicts
    if (data.code && data.code !== department.code) {
      const existing = await this.prisma.department.findUnique({
        where: { organizationId_code: { organizationId, code: data.code } },
      });

      if (existing) {
        throw new ConflictException('Department code already exists');
      }
    }

    return this.prisma.department.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
      include: {
        parent: true,
        _count: {
          select: { employees: true, children: true },
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const department = await this.prisma.department.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { employees: true, children: true },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department._count.employees > 0) {
      throw new ConflictException('Cannot delete department with employees');
    }

    if (department._count.children > 0) {
      throw new ConflictException('Cannot delete department with sub-departments');
    }

    return this.prisma.department.delete({ where: { id } });
  }

  async getHierarchy(organizationId: string, branchId?: string) {
    const where: any = { organizationId, parentId: null };
    if (branchId) where.branchId = branchId;

    const buildTree = async (departments: any[]) => {
      return Promise.all(
        departments.map(async (dept) => {
          const children = await this.prisma.department.findMany({
            where: { parentId: dept.id },
            include: {
              _count: { select: { employees: true } },
            },
          });

          return {
            ...dept,
            children: children.length > 0 ? await buildTree(children) : [],
          };
        }),
      );
    };

    const rootDepartments = await this.prisma.department.findMany({
      where,
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { code: 'asc' },
    });

    return buildTree(rootDepartments);
  }
}
