import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { DocumentSequenceService } from '../../core/services/document-sequence.service';

export interface GlAccountsConfig {
  accountsPayableId?: string;
  accountsReceivableId?: string;
  revenueId?: string;
  expenseId?: string;
  cashId?: string;
}

@Injectable()
export class FinancePostingService {
  constructor(
    private prisma: PrismaService,
    private documentSequence: DocumentSequenceService,
  ) {}

  private async getGlAccounts(organizationId: string): Promise<GlAccountsConfig | null> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { settings: true },
    });
    return (org?.settings as { glAccounts?: GlAccountsConfig })?.glAccounts ?? null;
  }

  async findFiscalPeriodByDate(organizationId: string, date: Date): Promise<string | null> {
    const period = await this.prisma.fiscalPeriod.findFirst({
      where: {
        organizationId,
        startDate: { lte: date },
        endDate: { gte: date },
        isClosed: false,
      },
      select: { id: true },
    });
    return period?.id ?? null;
  }

  /**
   * Create a journal entry for a posted bill (AP). Dr Expense, Cr AP.
   */
  async createJournalForBill(
    branchId: string,
    bill: { id: string; billNo: string; billDate: Date; totalAmount: number; vendorId: string },
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const gl = await this.getGlAccounts(organizationId);
    if (!gl?.accountsPayableId || !gl?.expenseId) return;

    const fiscalPeriodId = await this.findFiscalPeriodByDate(organizationId, new Date(bill.billDate));
    if (!fiscalPeriodId) return;

    const journalNo = await this.documentSequence.getNextNumber(branchId, 'FINANCE', 'JOURNAL');
    const amount = Number(bill.totalAmount);

    await this.prisma.journalEntry.create({
      data: {
        branchId,
        fiscalPeriodId,
        journalNo,
        entryDate: bill.billDate,
        description: `AP Bill ${bill.billNo}`,
        journalType: 'AP',
        source: 'BILL',
        sourceRef: bill.id,
        totalDebit: amount,
        totalCredit: amount,
        status: 'POSTED',
        postedBy: userId,
        postedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        journalLines: {
          create: [
            { lineNo: 1, accountId: gl.expenseId, description: `Bill ${bill.billNo}`, debit: amount, credit: 0 },
            { lineNo: 2, accountId: gl.accountsPayableId, description: `Bill ${bill.billNo}`, debit: 0, credit: amount },
          ],
        },
      },
    });
  }

  /**
   * Create a journal entry for a posted invoice (AR). Dr AR, Cr Revenue.
   */
  async createJournalForInvoice(
    branchId: string,
    invoice: { id: string; invoiceNo: string; invoiceDate: Date; totalAmount: number },
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const gl = await this.getGlAccounts(organizationId);
    if (!gl?.accountsReceivableId || !gl?.revenueId) return;

    const fiscalPeriodId = await this.findFiscalPeriodByDate(organizationId, new Date(invoice.invoiceDate));
    if (!fiscalPeriodId) return;

    const journalNo = await this.documentSequence.getNextNumber(branchId, 'FINANCE', 'JOURNAL');
    const amount = Number(invoice.totalAmount);

    await this.prisma.journalEntry.create({
      data: {
        branchId,
        fiscalPeriodId,
        journalNo,
        entryDate: invoice.invoiceDate,
        description: `AR Invoice ${invoice.invoiceNo}`,
        journalType: 'AR',
        source: 'INVOICE',
        sourceRef: invoice.id,
        totalDebit: amount,
        totalCredit: amount,
        status: 'POSTED',
        postedBy: userId,
        postedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        journalLines: {
          create: [
            { lineNo: 1, accountId: gl.accountsReceivableId, description: `Invoice ${invoice.invoiceNo}`, debit: amount, credit: 0 },
            { lineNo: 2, accountId: gl.revenueId, description: `Invoice ${invoice.invoiceNo}`, debit: 0, credit: amount },
          ],
        },
      },
    });
  }

  /**
   * Create a journal entry for a posted receipt. Dr Cash/Bank, Cr AR.
   */
  async createJournalForReceipt(
    branchId: string,
    receipt: { id: string; receiptNo: string; receiptDate: Date; amount: number },
    organizationId: string,
    userId: string,
  ): Promise<void> {
    const gl = await this.getGlAccounts(organizationId);
    if (!gl?.accountsReceivableId || !gl?.cashId) return;

    const fiscalPeriodId = await this.findFiscalPeriodByDate(organizationId, new Date(receipt.receiptDate));
    if (!fiscalPeriodId) return;

    const journalNo = await this.documentSequence.getNextNumber(branchId, 'FINANCE', 'JOURNAL');
    const amount = Number(receipt.amount);

    await this.prisma.journalEntry.create({
      data: {
        branchId,
        fiscalPeriodId,
        journalNo,
        entryDate: receipt.receiptDate,
        description: `Receipt ${receipt.receiptNo}`,
        journalType: 'AR_RECEIPT',
        source: 'RECEIPT',
        sourceRef: receipt.id,
        totalDebit: amount,
        totalCredit: amount,
        status: 'POSTED',
        postedBy: userId,
        postedAt: new Date(),
        createdBy: userId,
        updatedBy: userId,
        journalLines: {
          create: [
            { lineNo: 1, accountId: gl.cashId, description: `Receipt ${receipt.receiptNo}`, debit: amount, credit: 0 },
            { lineNo: 2, accountId: gl.accountsReceivableId, description: `Receipt ${receipt.receiptNo}`, debit: 0, credit: amount },
          ],
        },
      },
    });
  }
}
