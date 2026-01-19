import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BankAccountService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      branchName?: string;
      iban?: string;
      swiftCode?: string;
      isActive?: boolean;
    },
  ) {
    // Check if account number already exists
    const existing = await this.prisma.bankAccount.findFirst({
      where: {
        organizationId,
        accountNumber: data.accountNumber,
      },
    });

    if (existing) {
      throw new ConflictException('Bank account number already exists');
    }

    return this.prisma.bankAccount.create({
      data: {
        organizationId,
        accountName: data.accountName,
        accountNumber: data.accountNumber,
        bankName: data.bankName,
        branchName: data.branchName,
        iban: data.iban,
        swiftCode: data.swiftCode,
        isActive: data.isActive !== false,
      },
    });
  }

  async findAll(
    organizationId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      isActive?: boolean;
    },
  ) {
    const where: Prisma.BankAccountWhereInput = {
      organizationId,
    };

    if (params?.search) {
      where.OR = [
        { accountName: { contains: params.search, mode: 'insensitive' } },
        { accountNumber: { contains: params.search, mode: 'insensitive' } },
        { bankName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [accounts, total] = await Promise.all([
      this.prisma.bankAccount.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          _count: {
            select: {
              receipts: true,
              transactions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.bankAccount.count({ where }),
    ]);

    return {
      data: accounts,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string, organizationId: string) {
    const account = await this.prisma.bankAccount.findFirst({
      where: { id, organizationId },
      include: {
        _count: {
          select: {
            receipts: true,
            transactions: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Bank account not found');
    }

    return account;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      accountName?: string;
      branchName?: string;
      iban?: string;
      swiftCode?: string;
      isActive?: boolean;
    },
  ) {
    await this.findOne(id, organizationId);

    return this.prisma.bankAccount.update({
      where: { id },
      data: {
        accountName: data.accountName,
        branchName: data.branchName,
        iban: data.iban,
        swiftCode: data.swiftCode,
        isActive: data.isActive,
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const account = await this.findOne(id, organizationId);

    // Check if has transactions
    if (account._count.receipts > 0 || account._count.transactions > 0) {
      throw new ConflictException('Cannot delete bank account with transactions');
    }

    await this.prisma.bankAccount.delete({
      where: { id },
    });

    return { message: 'Bank account deleted successfully' };
  }
}
