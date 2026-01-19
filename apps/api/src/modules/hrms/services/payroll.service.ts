import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

@Injectable()
export class PayrollService {
  constructor(
    private prisma: PrismaService,
    private docSeqService: DocumentSequenceService,
  ) {}

  async findAll(organizationId: string, filters?: {
    status?: string;
    branchId?: string;
    periodStart?: Date;
    periodEnd?: Date;
  }) {
    const where: any = { organizationId };

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.branchId) {
      where.branchId = filters.branchId;
    }
    if (filters?.periodStart) {
      where.periodStart = { gte: filters.periodStart };
    }
    if (filters?.periodEnd) {
      where.periodEnd = { lte: filters.periodEnd };
    }

    const payrollRuns = await this.prisma.payrollRun.findMany({
      where,
      include: {
        _count: {
          select: {
            payslips: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payrollRuns.map(run => ({
      ...run,
      employeeCount: run._count.payslips,
      totalGross: Number(run.totalGross),
      totalDeductions: Number(run.totalDeductions),
      totalNet: Number(run.totalNet),
    }));
  }

  async findOne(id: string, organizationId: string) {
    const payrollRun = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId },
      include: {
        branch: true,
        payslips: {
          include: {
            employee: true,
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    return {
      ...payrollRun,
      totalGross: Number(payrollRun.totalGross),
      totalDeductions: Number(payrollRun.totalDeductions),
      totalNet: Number(payrollRun.totalNet),
      payslips: payrollRun.payslips.map(slip => ({
        ...slip,
        grossSalary: Number(slip.grossSalary),
        deductions: Number(slip.deductions),
        netSalary: Number(slip.netSalary),
      })),
    };
  }

  async create(
    organizationId: string,
    branchId: string,
    userId: string,
    data: {
      periodStart: Date;
      periodEnd: Date;
      paymentDate: Date;
    },
  ) {
    // Validate dates
    if (data.periodStart >= data.periodEnd) {
      throw new BadRequestException('Period start must be before period end');
    }

    if (data.paymentDate < data.periodEnd) {
      throw new BadRequestException('Payment date must be after period end');
    }

    // Check for overlapping payroll runs
    const overlapping = await this.prisma.payrollRun.findFirst({
      where: {
        organizationId,
        branchId,
        OR: [
          {
            AND: [
              { periodStart: { lte: data.periodStart } },
              { periodEnd: { gte: data.periodStart } },
            ],
          },
          {
            AND: [
              { periodStart: { lte: data.periodEnd } },
              { periodEnd: { gte: data.periodEnd } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Payroll run period overlaps with existing run');
    }

    // Generate run number
    const runNo = await this.docSeqService.getNextNumber(
      branchId,
      'HRMS',
      'PAYROLL',
    );

    // Create payroll run
    const payrollRun = await this.prisma.payrollRun.create({
      data: {
        organizationId,
        branchId,
        runNo,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        paymentDate: data.paymentDate,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        status: 'DRAFT',
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return {
      ...payrollRun,
      totalGross: Number(payrollRun.totalGross),
      totalDeductions: Number(payrollRun.totalDeductions),
      totalNet: Number(payrollRun.totalNet),
    };
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    data: {
      paymentDate?: Date;
      status?: string;
    },
  ) {
    const payrollRun = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    if (payrollRun.status === 'PAID') {
      throw new BadRequestException('Cannot update paid payroll run');
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });

    return {
      ...updated,
      totalGross: Number(updated.totalGross),
      totalDeductions: Number(updated.totalDeductions),
      totalNet: Number(updated.totalNet),
    };
  }

  async delete(id: string, organizationId: string) {
    const payrollRun = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            payslips: true,
          },
        },
      },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    if (payrollRun.status !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft payroll runs');
    }

    if (payrollRun._count.payslips > 0) {
      throw new BadRequestException('Cannot delete payroll run with payslips');
    }

    await this.prisma.payrollRun.delete({ where: { id } });

    return { message: 'Payroll run deleted successfully' };
  }

  async processPayroll(id: string, organizationId: string, userId: string) {
    const payrollRun = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    if (payrollRun.status !== 'DRAFT') {
      throw new BadRequestException('Can only process draft payroll runs');
    }

    // Get active employees for the branch
    const employees = await this.prisma.employee.findMany({
      where: {
        organizationId,
        branchId: payrollRun.branchId,
        status: 'ACTIVE',
        hireDate: { lte: payrollRun.periodEnd },
        OR: [
          { terminationDate: null },
          { terminationDate: { gte: payrollRun.periodStart } },
        ],
      },
    });

    if (employees.length === 0) {
      throw new BadRequestException('No active employees found for this period');
    }

    // Calculate payslips for each employee
    // Note: This is a simplified calculation. In production, you would:
    // 1. Get employee salary configuration
    // 2. Calculate working days
    // 3. Calculate allowances, bonuses
    // 4. Calculate deductions (tax, insurance, etc.)
    // 5. Calculate leaves, overtime, etc.

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    const payslips = employees.map(employee => {
      // Simplified calculation - $5000 base salary
      const grossSalary = 5000;
      const deductions = grossSalary * 0.2; // 20% deductions (tax, insurance)
      const netSalary = grossSalary - deductions;

      totalGross += grossSalary;
      totalDeductions += deductions;
      totalNet += netSalary;

      return {
        payrollRunId: id,
        employeeId: employee.id,
        basicSalary: grossSalary,
        grossSalary,
        deductions,
        netSalary,
        earnings: {
          basic: grossSalary,
        },
        deductionDetails: {
          tax: deductions * 0.7,
          insurance: deductions * 0.3,
        },
        workingDays: 22,
        presentDays: 22,
        leaveDays: 0,
        lopDays: 0,
        overtimeHours: 0,
      };
    });

    // Create payslips in transaction
    await this.prisma.$transaction(async (tx) => {
      // Delete existing payslips if any
      await tx.payslip.deleteMany({
        where: { payrollRunId: id },
      });

      // Create new payslips
      await tx.payslip.createMany({
        data: payslips,
      });

      // Update payroll run totals
      await tx.payrollRun.update({
        where: { id },
        data: {
          totalGross,
          totalDeductions,
          totalNet,
          status: 'PROCESSING',
          updatedBy: userId,
        },
      });
    });

    return this.findOne(id, organizationId);
  }

  async approvePayroll(id: string, organizationId: string, userId: string) {
    const payrollRun = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    if (payrollRun.status !== 'PROCESSING') {
      throw new BadRequestException('Can only approve processing payroll runs');
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'APPROVED',
        updatedBy: userId,
      },
    });

    return {
      ...updated,
      totalGross: Number(updated.totalGross),
      totalDeductions: Number(updated.totalDeductions),
      totalNet: Number(updated.totalNet),
    };
  }

  async markAsPaid(id: string, organizationId: string, userId: string) {
    const payrollRun = await this.prisma.payrollRun.findFirst({
      where: { id, organizationId },
    });

    if (!payrollRun) {
      throw new NotFoundException('Payroll run not found');
    }

    if (payrollRun.status !== 'APPROVED') {
      throw new BadRequestException('Can only mark approved payroll runs as paid');
    }

    const updated = await this.prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'PAID',
        updatedBy: userId,
      },
    });

    return {
      ...updated,
      totalGross: Number(updated.totalGross),
      totalDeductions: Number(updated.totalDeductions),
      totalNet: Number(updated.totalNet),
    };
  }

  async getPayslip(payrollRunId: string, employeeId: string, organizationId: string) {
    const payslip = await this.prisma.payslip.findFirst({
      where: {
        payrollRunId,
        employeeId,
        payrollRun: {
          organizationId,
        },
      },
      include: {
        employee: true,
        payrollRun: true,
      },
    });

    if (!payslip) {
      throw new NotFoundException('Payslip not found');
    }

    return {
      ...payslip,
      grossSalary: Number(payslip.grossSalary),
      deductions: Number(payslip.deductions),
      netSalary: Number(payslip.netSalary),
    };
  }
}
