import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

@Injectable()
export class JournalEntryService {
  constructor(
    private prisma: PrismaService,
    private documentSequenceService: DocumentSequenceService,
  ) {}

  async create(
    branchId: string,
    data: {
      fiscalPeriodId: string;
      entryDate: Date;
      description: string;
      journalType: string;
      source: string;
      sourceRef?: string;
      lines: Array<{
        accountId: string;
        description: string;
        debit: number;
        credit: number;
      }>;
    },
    userId: string,
  ) {
    // Validate balanced entry
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('Journal entry must be balanced (debits = credits)');
    }

    if (data.lines.length < 2) {
      throw new BadRequestException('Journal entry must have at least 2 lines');
    }

    // Validate all accounts exist and allow direct posting
    for (const line of data.lines) {
      const account = await this.prisma.chartOfAccount.findUnique({
        where: { id: line.accountId },
      });

      if (!account) {
        throw new NotFoundException(`Account ${line.accountId} not found`);
      }

      if (!account.allowDirectPosting) {
        throw new BadRequestException(
          `Account ${account.accountCode} does not allow direct posting`,
        );
      }
    }

    // Generate journal number
    const journalNo = await this.documentSequenceService.getNextNumber(
      branchId,
      'FINANCE',
      'JOURNAL',
    );

    return this.prisma.journalEntry.create({
      data: {
        branchId,
        fiscalPeriodId: data.fiscalPeriodId,
        journalNo,
        entryDate: data.entryDate,
        description: data.description,
        journalType: data.journalType,
        source: data.source,
        sourceRef: data.sourceRef,
        totalDebit,
        totalCredit,
        status: 'DRAFT',
        createdBy: userId,
        updatedBy: userId,
        journalLines: {
          create: data.lines.map((line, index) => ({
            lineNo: index + 1,
            accountId: line.accountId,
            description: line.description,
            debit: line.debit,
            credit: line.credit,
          })),
        },
      },
      include: {
        journalLines: {
          include: {
            account: {
              select: {
                id: true,
                accountCode: true,
                accountName: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(
    branchId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      journalType?: string;
      status?: string;
      fromDate?: Date;
      toDate?: Date;
    },
  ) {
    const where: Prisma.JournalEntryWhereInput = {
      branchId,
    };

    if (params?.search) {
      where.OR = [
        { journalNo: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { sourceRef: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.journalType) {
      where.journalType = params.journalType;
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.fromDate || params?.toDate) {
      where.entryDate = {};
      if (params.fromDate) {
        where.entryDate.gte = params.fromDate;
      }
      if (params.toDate) {
        where.entryDate.lte = params.toDate;
      }
    }

    const [entries, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          _count: {
            select: {
              journalLines: true,
            },
          },
        },
        orderBy: { entryDate: 'desc' },
      }),
      this.prisma.journalEntry.count({ where }),
    ]);

    return {
      data: entries,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: {
        journalLines: {
          include: {
            account: {
              select: {
                id: true,
                accountCode: true,
                accountName: true,
                accountType: true,
              },
            },
          },
          orderBy: { lineNo: 'asc' },
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        fiscalPeriod: {
          select: {
            id: true,
            periodName: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!entry) {
      throw new NotFoundException('Journal entry not found');
    }

    return entry;
  }

  async post(id: string, userId: string) {
    const entry = await this.findOne(id);

    if (entry.status !== 'DRAFT') {
      throw new BadRequestException('Only draft journal entries can be posted');
    }

    // Verify still balanced
    const totalDebit = entry.journalLines.reduce(
      (sum, line) => sum + Number(line.debit),
      0,
    );
    const totalCredit = entry.journalLines.reduce(
      (sum, line) => sum + Number(line.credit),
      0,
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('Journal entry is not balanced');
    }

    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        status: 'POSTED',
        postedBy: userId,
        postedAt: new Date(),
        updatedBy: userId,
      },
      include: {
        journalLines: {
          include: {
            account: true,
          },
        },
      },
    });
  }

  async void(id: string, userId: string) {
    const entry = await this.findOne(id);

    if (entry.status === 'VOID') {
      throw new BadRequestException('Journal entry is already voided');
    }

    if (entry.status === 'DRAFT') {
      throw new BadRequestException('Draft entries should be deleted, not voided');
    }

    return this.prisma.journalEntry.update({
      where: { id },
      data: {
        status: 'VOID',
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const entry = await this.findOne(id);

    if (entry.status !== 'DRAFT') {
      throw new BadRequestException('Only draft journal entries can be deleted');
    }

    await this.prisma.journalEntry.delete({
      where: { id },
    });

    return { message: 'Journal entry deleted successfully' };
  }
}
