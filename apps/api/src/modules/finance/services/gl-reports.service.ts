import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface AuditTrialRow {
  entryDate: string;
  journalNo: string;
  journalId: string;
  lineNo: number;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export interface AccountLedgerRow {
  entryDate: string;
  journalNo: string;
  journalId: string;
  lineNo: number;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

@Injectable()
export class GlReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Trial balance: aggregated debits and credits per account for posted journals in date range.
   */
  async getTrialBalance(
    organizationId: string,
    params: {
      branchId?: string;
      fromDate: Date;
      toDate: Date;
    },
  ): Promise<{ rows: TrialBalanceRow[]; fromDate: Date; toDate: Date }> {
    const where: Prisma.JournalEntryLineWhereInput = {
      journalEntry: {
        status: 'POSTED',
        entryDate: {
          gte: params.fromDate,
          lte: params.toDate,
        },
        branch: { organizationId },
      },
    };
    if (params.branchId) {
      (where.journalEntry as Prisma.JournalEntryWhereInput).branchId = params.branchId;
    }

    const lines = await this.prisma.journalEntryLine.findMany({
      where,
      include: {
        account: true,
        journalEntry: { select: { entryDate: true, journalNo: true } },
      },
      orderBy: [{ journalEntry: { entryDate: 'asc' } }, { lineNo: 'asc' }],
    });

    const byAccount = new Map<
      string,
      { account: { id: string; accountCode: string; accountName: string; accountType: string }; debit: number; credit: number }
    >();
    for (const line of lines) {
      const acc = line.account;
      const existing = byAccount.get(acc.id);
      const debit = Number(line.debit);
      const credit = Number(line.credit);
      if (!existing) {
        byAccount.set(acc.id, {
          account: { id: acc.id, accountCode: acc.accountCode, accountName: acc.accountName, accountType: acc.accountType },
          debit,
          credit,
        });
      } else {
        existing.debit += debit;
        existing.credit += credit;
      }
    }

    const rows: TrialBalanceRow[] = [];
    byAccount.forEach((v) => {
      const balance = v.debit - v.credit;
      rows.push({
        accountId: v.account.id,
        accountCode: v.account.accountCode,
        accountName: v.account.accountName,
        accountType: v.account.accountType,
        debit: v.debit,
        credit: v.credit,
        balance,
      });
    });
    rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode));
    return { rows, fromDate: params.fromDate, toDate: params.toDate };
  }

  /**
   * Audit trial: all posted journal entry lines in date order.
   */
  async getAuditTrial(
    organizationId: string,
    params: {
      branchId?: string;
      fromDate: Date;
      toDate: Date;
      accountId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ rows: AuditTrialRow[]; total: number }> {
    const where: Prisma.JournalEntryLineWhereInput = {
      journalEntry: {
        status: 'POSTED',
        entryDate: {
          gte: params.fromDate,
          lte: params.toDate,
        },
        branch: { organizationId },
      },
    };
    if (params.branchId) {
      (where.journalEntry as Prisma.JournalEntryWhereInput).branchId = params.branchId;
    }
    if (params.accountId) {
      where.accountId = params.accountId;
    }

    const [total, lines] = await Promise.all([
      this.prisma.journalEntryLine.count({ where }),
      this.prisma.journalEntryLine.findMany({
        where,
        include: {
          account: true,
          journalEntry: { select: { entryDate: true, journalNo: true } },
        },
        orderBy: [{ journalEntry: { entryDate: 'asc' } }, { journalEntry: { journalNo: 'asc' } }, { lineNo: 'asc' }],
        skip: params.offset ?? 0,
        take: Math.min(params.limit ?? 1000, 5000),
      }),
    ]);

    const rows: AuditTrialRow[] = lines.map((line) => ({
      entryDate: line.journalEntry.entryDate.toISOString().split('T')[0],
      journalNo: line.journalEntry.journalNo,
      journalId: line.journalId,
      lineNo: line.lineNo,
      accountCode: line.account.accountCode,
      accountName: line.account.accountName,
      description: line.description,
      debit: Number(line.debit),
      credit: Number(line.credit),
    }));
    return { rows, total };
  }

  /**
   * Account ledger: lines for one account with running balance.
   */
  async getAccountLedger(
    organizationId: string,
    params: {
      accountId: string;
      branchId?: string;
      fromDate: Date;
      toDate: Date;
    },
  ): Promise<{ rows: AccountLedgerRow[]; accountCode: string; accountName: string; fromDate: Date; toDate: Date }> {
    const account = await this.prisma.chartOfAccount.findFirst({
      where: { id: params.accountId, organizationId },
    });
    if (!account) {
      return { rows: [], accountCode: '', accountName: '', fromDate: params.fromDate, toDate: params.toDate };
    }

    const where: Prisma.JournalEntryLineWhereInput = {
      accountId: params.accountId,
      journalEntry: {
        status: 'POSTED',
        entryDate: {
          gte: params.fromDate,
          lte: params.toDate,
        },
        branch: { organizationId },
      },
    };
    if (params.branchId) {
      (where.journalEntry as Prisma.JournalEntryWhereInput).branchId = params.branchId;
    }

    const lines = await this.prisma.journalEntryLine.findMany({
      where,
      include: {
        journalEntry: { select: { entryDate: true, journalNo: true } },
      },
      orderBy: [{ journalEntry: { entryDate: 'asc' } }, { journalEntry: { journalNo: 'asc' } }, { lineNo: 'asc' }],
    });

    let runningBalance = 0;
    const rows: AccountLedgerRow[] = lines.map((line) => {
      const debit = Number(line.debit);
      const credit = Number(line.credit);
      runningBalance += debit - credit;
      return {
        entryDate: line.journalEntry.entryDate.toISOString().split('T')[0],
        journalNo: line.journalEntry.journalNo,
        journalId: line.journalId,
        lineNo: line.lineNo,
        description: line.description,
        debit,
        credit,
        runningBalance,
      };
    });

    return {
      rows,
      accountCode: account.accountCode,
      accountName: account.accountName,
      fromDate: params.fromDate,
      toDate: params.toDate,
    };
  }
}
