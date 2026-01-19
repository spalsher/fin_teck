import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    branchId: string,
    data: {
      employeeCode: string;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      dateOfBirth?: Date;
      hireDate: Date;
      departmentId?: string;
      designationId?: string;
      status?: string;
    },
    userId: string,
  ) {
    // Check if employee code already exists
    const existing = await this.prisma.employee.findFirst({
      where: {
        organizationId,
        employeeCode: data.employeeCode,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(`Employee code ${data.employeeCode} already exists`);
    }

    return this.prisma.employee.create({
      data: {
        organizationId,
        branchId,
        employeeCode: data.employeeCode,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        hireDate: data.hireDate,
        departmentId: data.departmentId,
        designationId: data.designationId,
        status: data.status || 'ACTIVE',
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
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
      branchId?: string;
      status?: string;
    },
  ) {
    const where: Prisma.EmployeeWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (params?.search) {
      where.OR = [
        { employeeCode: { contains: params.search, mode: 'insensitive' } },
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.branchId) {
      where.branchId = params.branchId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { employeeCode: 'asc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return {
      data: employees,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string, organizationId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
          },
        },
        _count: {
          select: {
            payslips: true,
          },
        },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      dateOfBirth?: Date;
      departmentId?: string;
      designationId?: string;
      status?: string;
      terminationDate?: Date;
    },
    userId: string,
  ) {
    await this.findOne(id, organizationId);

    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        departmentId: data.departmentId,
        designationId: data.designationId,
        status: data.status,
        terminationDate: data.terminationDate,
        updatedBy: userId,
      },
      include: {
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

  async delete(id: string, organizationId: string) {
    const employee = await this.findOne(id, organizationId);

    if (employee._count.payslips > 0) {
      throw new ConflictException('Cannot delete employee with payroll records');
    }

    // Soft delete
    await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Employee deleted successfully' };
  }

  async getSummary(organizationId: string) {
    const total = await this.prisma.employee.count({
      where: { organizationId, deletedAt: null },
    });

    const statusBreakdown = await this.prisma.employee.groupBy({
      by: ['status'],
      where: { organizationId, deletedAt: null },
      _count: { id: true },
    });

    return {
      totalEmployees: total,
      statusBreakdown,
    };
  }
}
