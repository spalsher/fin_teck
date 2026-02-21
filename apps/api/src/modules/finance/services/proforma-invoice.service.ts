import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProformaInvoiceService {
  constructor(
    private prisma: PrismaService,
    private documentSequence: DocumentSequenceService,
  ) {}

  async create(
    branchId: string,
    data: { customerId?: string; vendorId?: string; piDate: Date; totalAmount: number; notes?: string },
    userId: string,
  ) {
    const piNo = await this.documentSequence.getNextNumber(branchId, 'FINANCE', 'PI');
    return this.prisma.proformaInvoice.create({
      data: {
        branchId,
        piNo,
        piDate: data.piDate,
        customerId: data.customerId,
        vendorId: data.vendorId,
        totalAmount: data.totalAmount,
        notes: data.notes,
        status: 'DRAFT',
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        customer: { select: { id: true, customerCode: true, name: true } },
        vendor: { select: { id: true, vendorCode: true, name: true } },
      },
    });
  }

  async findAll(branchId: string, params?: { skip?: number; take?: number; status?: string }) {
    const where: Prisma.ProformaInvoiceWhereInput = { branchId };
    if (params?.status) where.status = params.status;
    const [items, total] = await Promise.all([
      this.prisma.proformaInvoice.findMany({
        where,
        skip: params?.skip,
        take: params?.take ?? 50,
        orderBy: { piDate: 'desc' },
        include: {
          customer: { select: { id: true, customerCode: true, name: true } },
          vendor: { select: { id: true, vendorCode: true, name: true } },
        },
      }),
      this.prisma.proformaInvoice.count({ where }),
    ]);
    return { data: items, total, page: params?.skip ? Math.floor(params.skip / (params.take ?? 10)) + 1 : 1, pageSize: params?.take ?? 10 };
  }

  async findOne(id: string) {
    const item = await this.prisma.proformaInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        vendor: true,
        branch: true,
        issuances: { orderBy: { issuanceDate: 'desc' } },
      },
    });
    if (!item) throw new NotFoundException('Proforma invoice not found');
    return item;
  }

  async addIssuance(proformaInvoiceId: string, data: { issuanceDate: Date; notes?: string }) {
    const pi = await this.findOne(proformaInvoiceId);
    return this.prisma.proformaInvoiceIssuance.create({
      data: {
        proformaInvoiceId,
        issuanceDate: data.issuanceDate,
        notes: data.notes,
      },
    });
  }
}
