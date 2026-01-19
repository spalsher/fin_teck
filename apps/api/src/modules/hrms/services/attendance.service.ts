import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  // ==================== SHIFT MANAGEMENT ====================

  async createShift(organizationId: string, data: any) {
    const existing = await this.prisma.shift.findUnique({
      where: { organizationId_code: { organizationId, code: data.code } },
    });

    if (existing) {
      throw new ConflictException('Shift code already exists');
    }

    return this.prisma.shift.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async findAllShifts(organizationId: string, filters?: any) {
    const where: any = { organizationId };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.shift.findMany({
      where,
      include: {
        _count: {
          select: { assignments: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOneShift(id: string, organizationId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id, organizationId },
      include: {
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                employeeCode: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          where: { isActive: true },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return shift;
  }

  async updateShift(id: string, organizationId: string, data: any) {
    const shift = await this.prisma.shift.findFirst({
      where: { id, organizationId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return this.prisma.shift.update({
      where: { id },
      data,
    });
  }

  async deleteShift(id: string, organizationId: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift._count.assignments > 0) {
      throw new ConflictException('Cannot delete shift with active assignments');
    }

    return this.prisma.shift.delete({ where: { id } });
  }

  // ==================== SHIFT ASSIGNMENTS ====================

  async assignShift(employeeId: string, shiftId: string, fromDate: Date, toDate?: Date) {
    // Deactivate any existing assignments that overlap
    await this.prisma.shiftAssignment.updateMany({
      where: {
        employeeId,
        isActive: true,
        OR: [
          { toDate: null },
          { toDate: { gte: fromDate } },
        ],
      },
      data: {
        isActive: false,
        toDate: new Date(fromDate.getTime() - 24 * 60 * 60 * 1000), // Day before new assignment
      },
    });

    return this.prisma.shiftAssignment.create({
      data: {
        employeeId,
        shiftId,
        fromDate,
        toDate,
        isActive: true,
      },
      include: {
        shift: true,
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getEmployeeShift(employeeId: string, date: Date) {
    const assignment = await this.prisma.shiftAssignment.findFirst({
      where: {
        employeeId,
        isActive: true,
        fromDate: { lte: date },
        OR: [
          { toDate: null },
          { toDate: { gte: date } },
        ],
      },
      include: {
        shift: true,
      },
    });

    return assignment;
  }

  // ==================== ATTENDANCE ====================

  async checkIn(employeeId: string, data: { location?: any; deviceInfo?: any }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in
    const existing = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (existing && existing.checkIn) {
      throw new BadRequestException('Already checked in for today');
    }

    const now = new Date();
    const shiftAssignment = await this.getEmployeeShift(employeeId, now);

    let lateBy = 0;
    if (shiftAssignment) {
      const [hours, minutes] = shiftAssignment.shift.startTime.split(':').map(Number);
      const shiftStart = new Date(now);
      shiftStart.setHours(hours, minutes, 0, 0);

      if (now > shiftStart) {
        lateBy = Math.floor((now.getTime() - shiftStart.getTime()) / (1000 * 60));
        lateBy = Math.max(0, lateBy - (shiftAssignment.shift.graceTime || 0));
      }
    }

    if (existing) {
      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: now,
          lateBy,
          location: data.location,
          deviceInfo: data.deviceInfo,
          status: 'PRESENT',
        },
      });
    }

    return this.prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        checkIn: now,
        lateBy,
        location: data.location,
        deviceInfo: data.deviceInfo,
        status: 'PRESENT',
      },
    });
  }

  async checkOut(employeeId: string, data: { location?: any; deviceInfo?: any }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: today,
        },
      },
    });

    if (!attendance) {
      throw new BadRequestException('No check-in found for today');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Already checked out for today');
    }

    const now = new Date();
    const shiftAssignment = await this.getEmployeeShift(employeeId, now);

    let earlyBy = 0;
    let workHours = 0;
    let overtimeHours = 0;

    if (attendance.checkIn) {
      const totalMinutes = Math.floor((now.getTime() - attendance.checkIn.getTime()) / (1000 * 60));
      workHours = totalMinutes / 60;

      if (shiftAssignment) {
        const breakMinutes = shiftAssignment.shift.breakDuration || 0;
        workHours = Math.max(0, (totalMinutes - breakMinutes) / 60);

        const [hours, minutes] = shiftAssignment.shift.endTime.split(':').map(Number);
        const shiftEnd = new Date(now);
        shiftEnd.setHours(hours, minutes, 0, 0);

        if (now < shiftEnd) {
          earlyBy = Math.floor((shiftEnd.getTime() - now.getTime()) / (1000 * 60));
        } else {
          overtimeHours = Math.max(0, (now.getTime() - shiftEnd.getTime()) / (1000 * 60 * 60));
        }
      }
    }

    return this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        workHours: new Decimal(workHours.toFixed(2)),
        overtimeHours: overtimeHours > 0 ? new Decimal(overtimeHours.toFixed(2)) : new Decimal(0),
        earlyBy,
      },
    });
  }

  async findAllAttendance(organizationId: string, filters?: any) {
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
      where.date = { gte: new Date(filters.fromDate) };
    }

    if (filters?.toDate) {
      where.date = { ...where.date, lte: new Date(filters.toDate) };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        include: {
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
        orderBy: [{ date: 'desc' }, { employee: { employeeCode: 'asc' } }],
        skip: filters?.skip || 0,
        take: filters?.take || 50,
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor((filters?.skip || 0) / (filters?.take || 50)) + 1,
      pageSize: filters?.take || 50,
    };
  }

  async getEmployeeAttendance(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async markAbsent(employeeId: string, date: Date, notes?: string) {
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: { employeeId, date },
      },
    });

    if (attendance) {
      return this.prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          status: 'ABSENT',
          notes,
        },
      });
    }

    return this.prisma.attendance.create({
      data: {
        employeeId,
        date,
        status: 'ABSENT',
        notes,
      },
    });
  }

  async markLeave(employeeId: string, date: Date) {
    const attendance = await this.prisma.attendance.findUnique({
      where: {
        employeeId_date: { employeeId, date },
      },
    });

    if (attendance) {
      return this.prisma.attendance.update({
        where: { id: attendance.id },
        data: { status: 'LEAVE' },
      });
    }

    return this.prisma.attendance.create({
      data: {
        employeeId,
        date,
        status: 'LEAVE',
      },
    });
  }

  async updateAttendance(id: string, organizationId: string, data: any) {
    const attendance = await this.prisma.attendance.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    return this.prisma.attendance.update({
      where: { id },
      data,
    });
  }

  // ==================== OVERTIME ====================

  async createOvertimeRequest(employeeId: string, data: any) {
    return this.prisma.overtimeRequest.create({
      data: {
        ...data,
        employeeId,
        status: 'PENDING',
      },
      include: {
        employee: {
          select: {
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
          },
        },
      },
    });
  }

  async findAllOvertimeRequests(organizationId: string, filters?: any) {
    const where: any = {
      employee: { organizationId },
    };

    if (filters?.employeeId) {
      where.employeeId = filters.employeeId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.overtimeRequest.findMany({
        where,
        include: {
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
        orderBy: { appliedDate: 'desc' },
        skip: filters?.skip || 0,
        take: filters?.take || 50,
      }),
      this.prisma.overtimeRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page: Math.floor((filters?.skip || 0) / (filters?.take || 50)) + 1,
      pageSize: filters?.take || 50,
    };
  }

  async approveOvertimeRequest(id: string, organizationId: string, reviewerId: string, notes?: string) {
    const request = await this.prisma.overtimeRequest.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!request) {
      throw new NotFoundException('Overtime request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    return this.prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedDate: new Date(),
        reviewNotes: notes,
      },
    });
  }

  async rejectOvertimeRequest(id: string, organizationId: string, reviewerId: string, notes: string) {
    const request = await this.prisma.overtimeRequest.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!request) {
      throw new NotFoundException('Overtime request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    return this.prisma.overtimeRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewedDate: new Date(),
        reviewNotes: notes,
      },
    });
  }

  // ==================== REPORTS ====================

  async getAttendanceSummary(organizationId: string, month: number, year: number, departmentId?: string) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const where: any = {
      employee: { organizationId },
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (departmentId) {
      where.employee.departmentId = departmentId;
    }

    const attendance = await this.prisma.attendance.groupBy({
      by: ['employeeId', 'status'],
      where,
      _count: true,
    });

    const summary: any = {};

    for (const record of attendance) {
      if (!summary[record.employeeId]) {
        summary[record.employeeId] = {
          present: 0,
          absent: 0,
          leave: 0,
          halfDay: 0,
          holiday: 0,
        };
      }

      const status = record.status.toLowerCase();
      if (status === 'present') summary[record.employeeId].present = record._count;
      else if (status === 'absent') summary[record.employeeId].absent = record._count;
      else if (status === 'leave') summary[record.employeeId].leave = record._count;
      else if (status === 'half_day') summary[record.employeeId].halfDay = record._count;
      else if (status === 'holiday') summary[record.employeeId].holiday = record._count;
    }

    return summary;
  }
}
