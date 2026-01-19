import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class EmployeeDocumentService {
  constructor(private prisma: PrismaService) {}

  async create(employeeId: string, organizationId: string, data: any) {
    // Verify employee exists and belongs to organization
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.prisma.employeeDocument.create({
      data: {
        ...data,
        employeeId,
      },
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
    });
  }

  async findAllByEmployee(employeeId: string, organizationId: string, filters?: any) {
    // Verify employee exists and belongs to organization
    const employee = await this.prisma.employee.findFirst({
      where: { id: employeeId, organizationId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const where: any = { employeeId };

    if (filters?.documentType) {
      where.documentType = filters.documentType;
    }

    return this.prisma.employeeDocument.findMany({
      where,
      orderBy: [{ documentType: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const document = await this.prisma.employeeDocument.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
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
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(id: string, organizationId: string, data: any) {
    const document = await this.prisma.employeeDocument.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.employeeDocument.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, organizationId: string) {
    const document = await this.prisma.employeeDocument.findFirst({
      where: {
        id,
        employee: { organizationId },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.employeeDocument.delete({ where: { id } });
  }

  async getExpiringDocuments(organizationId: string, daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.prisma.employeeDocument.findMany({
      where: {
        employee: { organizationId },
        expiryDate: {
          gte: new Date(),
          lte: futureDate,
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getExpiredDocuments(organizationId: string) {
    return this.prisma.employeeDocument.findMany({
      where: {
        employee: { organizationId },
        expiryDate: {
          lt: new Date(),
        },
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            department: { select: { name: true } },
          },
        },
      },
      orderBy: { expiryDate: 'desc' },
    });
  }

  async getDocumentsByType(organizationId: string, documentType: string) {
    return this.prisma.employeeDocument.findMany({
      where: {
        employee: { organizationId },
        documentType,
      },
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
      orderBy: [{ employee: { employeeCode: 'asc' } }, { createdAt: 'desc' }],
    });
  }
}
