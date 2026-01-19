import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChartOfAccountService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    data: {
      accountCode: string;
      accountName: string;
      accountType: string;
      accountCategory: string;
      parentId?: string;
      level: number;
      isControlAccount?: boolean;
      allowDirectPosting?: boolean;
      isActive?: boolean;
    },
    userId: string,
  ) {
    // Check if account code already exists
    const existing = await this.prisma.chartOfAccount.findFirst({
      where: {
        organizationId,
        accountCode: data.accountCode,
      },
    });

    if (existing) {
      throw new ConflictException(`Account code ${data.accountCode} already exists`);
    }

    // Validate parent if provided
    if (data.parentId) {
      const parent = await this.prisma.chartOfAccount.findUnique({
        where: { id: data.parentId },
      });

      if (!parent || parent.organizationId !== organizationId) {
        throw new NotFoundException('Parent account not found');
      }
    }

    return this.prisma.chartOfAccount.create({
      data: {
        organizationId,
        accountCode: data.accountCode,
        accountName: data.accountName,
        accountType: data.accountType,
        accountCategory: data.accountCategory,
        parentId: data.parentId,
        level: data.level,
        isControlAccount: data.isControlAccount || false,
        allowDirectPosting: data.allowDirectPosting !== false,
        isActive: data.isActive !== false,
        createdBy: userId,
        updatedBy: userId,
      },
      include: {
        parent: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
          },
        },
      },
    });
  }

  async findAll(
    organizationId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      accountType?: string;
      accountCategory?: string;
      parentId?: string;
      isActive?: boolean;
    },
  ) {
    const where: Prisma.ChartOfAccountWhereInput = {
      organizationId,
    };

    if (params?.search) {
      where.OR = [
        { accountCode: { contains: params.search, mode: 'insensitive' } },
        { accountName: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.accountType) {
      where.accountType = params.accountType;
    }

    if (params?.accountCategory) {
      where.accountCategory = params.accountCategory;
    }

    if (params?.parentId) {
      where.parentId = params.parentId;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [accounts, total] = await Promise.all([
      this.prisma.chartOfAccount.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          parent: {
            select: {
              id: true,
              accountCode: true,
              accountName: true,
            },
          },
          _count: {
            select: {
              children: true,
              journalEntryLines: true,
            },
          },
        },
        orderBy: { accountCode: 'asc' },
      }),
      this.prisma.chartOfAccount.count({ where }),
    ]);

    return {
      data: accounts,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string, organizationId: string) {
    const account = await this.prisma.chartOfAccount.findFirst({
      where: { id, organizationId },
      include: {
        parent: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
          },
        },
        children: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
            accountType: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            children: true,
            journalEntryLines: true,
          },
        },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async update(
    id: string,
    organizationId: string,
    data: {
      accountName?: string;
      accountCategory?: string;
      allowDirectPosting?: boolean;
      isActive?: boolean;
    },
    userId: string,
  ) {
    await this.findOne(id, organizationId);

    return this.prisma.chartOfAccount.update({
      where: { id },
      data: {
        accountName: data.accountName,
        accountCategory: data.accountCategory,
        allowDirectPosting: data.allowDirectPosting,
        isActive: data.isActive,
        updatedBy: userId,
      },
      include: {
        parent: {
          select: {
            id: true,
            accountCode: true,
            accountName: true,
          },
        },
      },
    });
  }

  async delete(id: string, organizationId: string) {
    const account = await this.findOne(id, organizationId);

    // Check if has children
    if (account._count.children > 0) {
      throw new BadRequestException('Cannot delete account with child accounts');
    }

    // Check if has transactions
    if (account._count.journalEntryLines > 0) {
      throw new BadRequestException('Cannot delete account with journal entries');
    }

    await this.prisma.chartOfAccount.delete({
      where: { id },
    });

    return { message: 'Account deleted successfully' };
  }

  async getHierarchy(organizationId: string) {
    // Get all accounts and build hierarchy
    const accounts = await this.prisma.chartOfAccount.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: { accountCode: 'asc' },
    });

    // Build tree structure
    type AccountNode = typeof accounts[0] & { children: AccountNode[] };
    const accountMap = new Map<string, AccountNode>();
    const roots: AccountNode[] = [];

    accounts.forEach((account) => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    accounts.forEach((account) => {
      const node = accountMap.get(account.id);
      if (node && account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else if (node) {
        roots.push(node);
      }
    });

    return roots;
  }
}
