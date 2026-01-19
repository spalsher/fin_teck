import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  // ==================== LEAVE TYPES ====================

  async createLeaveType(organizationId: string, data: any) {
    const existing = await this.prisma.leaveType.findUnique({
      where: { organizationId_code: { organizationId, code: data.code } },
    });

    if (existing) {
      throw new ConflictException('Leave type code already exists');
    }

    return this.prisma.leaveType.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async findAllLeaveTypes(organizationId: string, filters?: any) {
    const where: any = { organizationId };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.leaveType.findMany({
      where,
      include: {
        _count: {
          select: { requests: true, balances: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOneLeaveType(id: string, organizationId: string) {
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, organizationId },
      include: {
        policies: true,
        _count: {
          select: { requests: true, balances: true },
        },
      },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return leaveType;
  }

  async updateLeaveType(id: string, organizationId: string, data: any) {
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, organizationId },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    return this.prisma.leaveType.update({
      where: { id },
      data,
    });
  }

  async deleteLeaveType(id: string, organizationId: string) {
    const leaveType = await this.prisma.leaveType.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { requests: true, balances: true },
        },
      },
    });

    if (!leaveType) {
      throw new NotFoundException('Leave type not found');
    }

    if (leaveType._count.requests > 0 || leaveType._count.balances > 0) {
      throw new ConflictException('Cannot delete leave type with existing requests or balances');
    }

    return this.prisma.leaveType.delete({ where: { id } });
  }

  // ==================== LEAVE BALANCES ====================

  async getEmployeeLeaveBalances(employeeId: string, year?: number) {
    const currentYear = year || new Date().getFullYear();

    const balances = await this.prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
      include: {
        leaveType: {
          select: {
            id: true,
            code: true,
            name: true,
            isPaid: true,
            color: true,
          },
        },
      },
      orderBy: {
        leaveType: { code: 'asc' },
      },
    });

    return balances;
  }

  async initializeLeaveBalances(employeeId: string, organizationId: string, year: number) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const leaveTypes = await this.prisma.leaveType.findMany({
      where: { organizationId, isActive: true },
    });

    const balances: any[] = [];

    for (const leaveType of leaveTypes) {
      // Check if balance already exists
      const existing = await this.prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId,
            leaveTypeId: leaveType.id,
            year,
          },
        },
      });

      if (!existing) {
        const opening = leaveType.maxDaysPerYear || new Decimal(0);
        balances.push(
          await this.prisma.leaveBalance.create({
            data: {
              employeeId,
              leaveTypeId: leaveType.id,
              year,
              opening,
              accrued: new Decimal(0),
              used: new Decimal(0),
              carriedForward: new Decimal(0),
              encashed: new Decimal(0),
              balance: opening,
            },
          }),
        );
      }
    }

    return balances;
  }

  async accrueLeaves(employeeId: string, leaveTypeId: string, year: number, days: number) {
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
      },
    });

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    const accrued = new Decimal(balance.accrued).plus(days);
    const newBalance = new Decimal(balance.opening)
      .plus(accrued)
      .plus(balance.carriedForward)
      .minus(balance.used)
      .minus(balance.encashed);

    return this.prisma.leaveBalance.update({
      where: {
        employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year },
      },
      data: {
        accrued,
        balance: newBalance,
      },
    });
  }

  // ==================== LEAVE REQUESTS ====================

  async createLeaveRequest(employeeId: string, data: any) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check leave balance
    const year = new Date(data.fromDate).getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: data.leaveTypeId,
          year,
        },
      },
      include: { leaveType: true },
    });

    if (!balance) {
      throw new BadRequestException('Leave balance not found for this year');
    }

    if (new Decimal(balance.balance).lessThan(data.days)) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${balance.balance}, Requested: ${data.days}`,
      );
    }

    // Check for overlapping leave requests
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [
              { fromDate: { lte: new Date(data.fromDate) } },
              { toDate: { gte: new Date(data.fromDate) } },
            ],
          },
          {
            AND: [
              { fromDate: { lte: new Date(data.toDate) } },
              { toDate: { gte: new Date(data.toDate) } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new ConflictException('Leave request overlaps with existing leave');
    }

    return this.prisma.leaveRequest.create({
      data: {
        ...data,
        employeeId,
        status: 'PENDING',
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  async findAllLeaveRequests(organizationId: string, filters?: any) {
    const where: any = {
      employee: { organizationId },
    };

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.departmentId) {
      where.employee = { ...where.employee, departmentId: filters.departmentId };
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.fromDate) {
      where.fromDate = { gte: new Date(filters.fromDate) };
    }

    if (filters?.toDate) {
      where.toDate = { lte: new Date(filters.toDate) };
    }

    const [data, total] = await Promise.all([
      this.prisma.leaveRequest.findMany({
        where,
        include: {
          leaveType: {
            select: {
              id: true,
              code: true,
              name: true,
              color: true,
            },
          },
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              email: true,
              department: { select: { name: true } },
              designation: { select: { title: true } },
            },
          },
        },
        orderBy: { appliedDate: 'desc' },
        skip: filters?.skip || 0,
        take: filters?.take || 50,
      }),
      this.prisma.leaveRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor((filters?.skip || 0) / (filters?.take || 50)) + 1,
      pageSize: filters?.take || 50,
    };
  }

  async findOneLeaveRequest(id: string, organizationId: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            department: { select: { name: true } },
            designation: { select: { title: true } },
            manager: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    return request;
  }

  async approveLeaveRequest(id: string, organizationId: string, reviewerId: string, notes?: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    // Update leave balance
    const year = new Date(request.fromDate).getFullYear();
    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: request.employeeId,
          leaveTypeId: request.leaveTypeId,
          year,
        },
      },
    });

    if (balance) {
      const used = new Decimal(balance.used).plus(request.days);
      const newBalance = new Decimal(balance.opening)
        .plus(balance.accrued)
        .plus(balance.carriedForward)
        .minus(used)
        .minus(balance.encashed);

      await this.prisma.leaveBalance.update({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
          },
        },
        data: {
          used,
          balance: newBalance,
        },
      });
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedDate: new Date(),
        reviewNotes: notes,
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async rejectLeaveRequest(id: string, organizationId: string, reviewerId: string, notes: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedDate: new Date(),
        reviewNotes: notes,
      },
      include: {
        leaveType: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async cancelLeaveRequest(id: string, employeeId: string, organizationId: string) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: {
        id,
        employeeId,
        employee: { organizationId },
      },
    });

    if (!request) {
      throw new NotFoundException('Leave request not found');
    }

    if (request.status === 'CANCELLED') {
      throw new BadRequestException('Request is already cancelled');
    }

    // If approved, restore leave balance
    if (request.status === 'APPROVED') {
      const year = new Date(request.fromDate).getFullYear();
      const balance = await this.prisma.leaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: request.employeeId,
            leaveTypeId: request.leaveTypeId,
            year,
          },
        },
      });

      if (balance) {
        const used = new Decimal(balance.used).minus(request.days);
        const newBalance = new Decimal(balance.opening)
          .plus(balance.accrued)
          .plus(balance.carriedForward)
          .minus(used)
          .minus(balance.encashed);

        await this.prisma.leaveBalance.update({
          where: {
            employeeId_leaveTypeId_year: {
              employeeId: request.employeeId,
              leaveTypeId: request.leaveTypeId,
              year,
            },
          },
          data: {
            used,
            balance: newBalance,
          },
        });
      }
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  // ==================== LEAVE CALENDAR ====================

  async getLeaveCalendar(organizationId: string, fromDate: Date, toDate: Date, departmentId?: string) {
    const where: any = {
      employee: { organizationId },
      status: 'APPROVED',
      OR: [
        {
          AND: [{ fromDate: { lte: toDate } }, { toDate: { gte: fromDate } }],
        },
      ],
    };

    if (departmentId) {
      where.employee.departmentId = departmentId;
    }

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        leaveType: {
          select: {
            name: true,
            color: true,
          },
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { fromDate: 'asc' },
    });
  }
}
