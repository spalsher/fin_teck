import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(
    branchId: string,
    data: {
      customerCode: string;
      name: string;
      customerType: string;
      taxId?: string;
      contacts: Array<{
        name: string;
        email: string;
        phone: string;
        isPrimary: boolean;
      }>;
      billingAddress: any;
      shippingAddress?: any;
      creditLimit?: number;
      paymentTermDays?: number;
      isActive?: boolean;
    },
    userId: string,
  ) {
    // Check if customer code already exists
    const existing = await this.prisma.customer.findFirst({
      where: {
        branchId,
        customerCode: data.customerCode,
      },
    });

    if (existing) {
      throw new ConflictException(`Customer with code ${data.customerCode} already exists`);
    }

    return this.prisma.customer.create({
      data: {
        branchId,
        customerCode: data.customerCode,
        name: data.name,
        customerType: data.customerType,
        taxId: data.taxId,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress || data.billingAddress,
        creditLimit: data.creditLimit || 0,
        paymentTermDays: data.paymentTermDays || 30,
        isActive: data.isActive !== undefined ? data.isActive : true,
        createdBy: userId,
        updatedBy: userId,
        customerContacts: {
          create: data.contacts,
        },
      },
      include: {
        customerContacts: true,
      },
    });
  }

  async findAll(
    branchId: string,
    params?: {
      skip?: number;
      take?: number;
      search?: string;
      customerType?: string;
      isActive?: boolean;
    },
  ) {
    const where: Prisma.CustomerWhereInput = {
      branchId,
      deletedAt: null,
    };

    if (params?.search) {
      where.OR = [
        { customerCode: { contains: params.search, mode: 'insensitive' } },
        { name: { contains: params.search, mode: 'insensitive' } },
        { taxId: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.customerType) {
      where.customerType = params.customerType;
    }

    if (params?.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: params?.skip,
        take: params?.take,
        include: {
          customerContacts: true,
          _count: {
            select: {
              invoices: true,
              receipts: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      total,
      page: params?.skip ? Math.floor(params.skip / (params?.take || 10)) + 1 : 1,
      pageSize: params?.take || 10,
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        customerContacts: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            invoices: true,
            receipts: true,
            customerServices: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(
    id: string,
    data: {
      name?: string;
      taxId?: string;
      billingAddress?: any;
      shippingAddress?: any;
      creditLimit?: number;
      paymentTermDays?: number;
      isActive?: boolean;
      contacts?: Array<{
        id?: string;
        name: string;
        email: string;
        phone: string;
        isPrimary: boolean;
      }>;
    },
    userId: string,
  ) {
    const customer = await this.findOne(id);

    const updateData: Prisma.CustomerUpdateInput = {
      name: data.name,
      taxId: data.taxId,
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      creditLimit: data.creditLimit,
      paymentTermDays: data.paymentTermDays,
      isActive: data.isActive,
      updatedBy: userId,
    };

    // Handle contacts update
    if (data.contacts) {
      // Delete existing contacts
      await this.prisma.customerContact.deleteMany({
        where: { customerId: id },
      });

      // Create new contacts
      updateData.customerContacts = {
        create: data.contacts.map((contact) => ({
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          isPrimary: contact.isPrimary,
        })),
      };
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateData,
      include: {
        customerContacts: true,
      },
    });
  }

  async delete(id: string) {
    const customer = await this.findOne(id);

    // Check if customer has any transactions
    const transactionCount = await this.prisma.invoice.count({
      where: { customerId: id },
    });

    if (transactionCount > 0) {
      throw new ConflictException('Cannot delete customer with existing transactions');
    }

    // Soft delete
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Customer deleted successfully' };
  }

  async getBalance(customerId: string) {
    const customer = await this.findOne(customerId);

    const [invoices, receipts] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          customerId,
          status: { in: ['POSTED', 'PARTIALLY_PAID'] },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      this.prisma.receipt.aggregate({
        where: {
          customerId,
          status: 'POSTED',
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const totalInvoices = Number(invoices._sum.totalAmount || 0);
    const totalReceipts = Number(receipts._sum.amount || 0);
    const balance = totalInvoices - totalReceipts;

    return {
      customerId,
      customerName: customer.name,
      totalInvoices,
      totalReceipts,
      balance,
      creditLimit: Number(customer.creditLimit),
      availableCredit: Number(customer.creditLimit) - balance,
    };
  }
}
