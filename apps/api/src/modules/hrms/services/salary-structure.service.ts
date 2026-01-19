import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SalaryStructureService {
  constructor(private prisma: PrismaService) {}

  async create(employeeId: string, organizationId: string, data: any, userId: string) {
    // Verify employee exists and belongs to organization
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Deactivate any existing active salary structures
    await this.prisma.salaryStructure.updateMany({
      where: {
        employeeId,
        isActive: true,
      },
      data: {
        isActive: false,
        effectiveTo: new Date(data.effectiveFrom.getTime() - 24 * 60 * 60 * 1000), // Day before new structure
      },
    });

    // Create new salary structure with components
    return this.prisma.salaryStructure.create({
      data: {
        employeeId,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        basicSalary: data.basicSalary,
        currency: data.currency || 'PKR',
        payFrequency: data.payFrequency || 'MONTHLY',
        isActive: true,
        notes: data.notes,
        createdBy: userId,
        updatedBy: userId,
        components: {
          create: data.components || [],
        },
      },
      include: {
        components: true,
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findByEmployee(employeeId: string, organizationId: string, activeOnly: boolean = false) {
    // Verify employee exists and belongs to organization
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const where: any = { employeeId };
    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.salaryStructure.findMany({
      where,
      include: {
        components: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async getActiveStructure(employeeId: string, organizationId: string, date?: Date) {
    // Verify employee exists and belongs to organization
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const effectiveDate = date || new Date();

    const structure = await this.prisma.salaryStructure.findFirst({
      where: {
        employeeId,
        isActive: true,
        effectiveFrom: { lte: effectiveDate },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: effectiveDate } },
        ],
      },
      include: {
        components: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException('No active salary structure found for this employee');
    }

    return structure;
  }

  async findOne(id: string, organizationId: string) {
    const structure = await this.prisma.salaryStructure.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
      include: {
        components: {
          orderBy: { displayOrder: 'asc' },
        },
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            department: { select: { name: true } },
            designation: { select: { title: true } },
          },
        },
      },
    });

    if (!structure) {
      throw new NotFoundException('Salary structure not found');
    }

    return structure;
  }

  async update(id: string, organizationId: string, data: any, userId: string) {
    const structure = await this.prisma.salaryStructure.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!structure) {
      throw new NotFoundException('Salary structure not found');
    }

    // If updating components, delete existing and recreate
    if (data.components) {
      await this.prisma.salaryComponent.deleteMany({
        where: { salaryStructureId: id },
      });
    }

    return this.prisma.salaryStructure.update({
      where: { id },
      data: {
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        basicSalary: data.basicSalary,
        currency: data.currency,
        payFrequency: data.payFrequency,
        isActive: data.isActive,
        notes: data.notes,
        updatedBy: userId,
        ...(data.components && {
          components: {
            create: data.components,
          },
        }),
      },
      include: {
        components: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async deactivate(id: string, organizationId: string, effectiveTo: Date) {
    const structure = await this.prisma.salaryStructure.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!structure) {
      throw new NotFoundException('Salary structure not found');
    }

    return this.prisma.salaryStructure.update({
      where: { id },
      data: {
        isActive: false,
        effectiveTo,
      },
    });
  }

  async calculateGrossSalary(salaryStructureId: string, organizationId: string) {
    const structure = await this.findOne(salaryStructureId, organizationId);

    let grossSalary = new Decimal(structure.basicSalary);
    const earnings: any[] = [];
    const deductions: any[] = [];

    for (const component of structure.components) {
      let amount = new Decimal(0);

      switch (component.calculationType) {
        case 'FIXED':
          amount = new Decimal(component.value);
          break;
        case 'PERCENTAGE_OF_BASIC':
          amount = new Decimal(structure.basicSalary).mul(component.value).div(100);
          break;
        case 'PERCENTAGE_OF_GROSS':
          amount = grossSalary.mul(component.value).div(100);
          break;
      }

      if (component.componentType === 'EARNING') {
        grossSalary = grossSalary.plus(amount);
        earnings.push({
          name: component.componentName,
          amount: amount.toNumber(),
          isTaxable: component.isTaxable,
        });
      } else if (component.componentType === 'DEDUCTION') {
        deductions.push({
          name: component.componentName,
          amount: amount.toNumber(),
          isStatutory: component.isStatutory,
        });
      }
    }

    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const netSalary = grossSalary.minus(totalDeductions);

    return {
      basicSalary: structure.basicSalary,
      earnings,
      grossSalary: grossSalary.toNumber(),
      deductions,
      totalDeductions,
      netSalary: netSalary.toNumber(),
    };
  }

  async bulkCreateStructures(
    organizationId: string,
    structures: Array<{ employeeId: string; data: any }>,
    userId: string,
  ) {
    const results: any[] = [];

    for (const { employeeId, data } of structures) {
      try {
        const structure = await this.create(employeeId, organizationId, data, userId);
        results.push({ success: true, employeeId, structure });
      } catch (error) {
        results.push({ success: false, employeeId, error: error.message });
      }
    }

    return results;
  }
}
