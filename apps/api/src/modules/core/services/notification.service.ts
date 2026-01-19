import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    link?: string;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  async findByUser(userId: string, options?: {
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { userId };
    
    if (options?.isRead !== undefined) {
      where.isRead = options.isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.delete({
      where: { id, userId },
    });
  }

  async deleteAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  // Helper methods for creating specific notification types
  async notifyInvoicePosted(userId: string, invoiceNumber: string, invoiceId: string) {
    return this.create({
      userId,
      type: 'success',
      title: 'Invoice Posted',
      message: `Invoice ${invoiceNumber} has been posted successfully`,
      link: `/finance/invoices/${invoiceId}`,
    });
  }

  async notifyPaymentReceived(userId: string, amount: number, customerName: string) {
    return this.create({
      userId,
      type: 'success',
      title: 'Payment Received',
      message: `Payment of ${amount} received from ${customerName}`,
      link: `/finance/receipts`,
    });
  }

  async notifyLowStock(userId: string, itemName: string, quantity: number) {
    return this.create({
      userId,
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${itemName} is running low (${quantity} remaining)`,
      link: `/scm/inventory`,
    });
  }

  async notifyPOApproved(userId: string, poNumber: string, poId: string) {
    return this.create({
      userId,
      type: 'info',
      title: 'Purchase Order Approved',
      message: `Purchase Order ${poNumber} has been approved`,
      link: `/scm/purchase-orders/${poId}`,
    });
  }
}
