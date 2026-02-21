import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VehicleBookingService {
  constructor(private prisma: PrismaService) {}

  async create(
    organizationId: string,
    branchId: string | null,
    data: { vehicleRef: string; bookingDate: Date; purpose?: string },
    userId: string,
  ) {
    let bid = branchId;
    if (!bid) {
      const b = await this.prisma.branch.findFirst({ where: { organizationId }, select: { id: true } });
      if (!b) throw new NotFoundException('No branch found');
      bid = b.id;
    }
    return this.prisma.vehicleBooking.create({
      data: {
        organizationId,
        branchId: bid,
        vehicleRef: data.vehicleRef,
        bookingDate: data.bookingDate,
        purpose: data.purpose,
        status: 'BOOKED',
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  async findAll(organizationId: string, params?: { branchId?: string; fromDate?: Date; toDate?: Date; skip?: number; take?: number }) {
    const where: Prisma.VehicleBookingWhereInput = { organizationId };
    if (params?.branchId) where.branchId = params.branchId;
    if (params?.fromDate || params?.toDate) {
      where.bookingDate = {};
      if (params.fromDate) where.bookingDate.gte = params.fromDate;
      if (params.toDate) where.bookingDate.lte = params.toDate;
    }
    const [items, total] = await Promise.all([
      this.prisma.vehicleBooking.findMany({
        where,
        skip: params?.skip,
        take: params?.take ?? 50,
        orderBy: { bookingDate: 'desc' },
        include: { branch: { select: { id: true, name: true, code: true } } },
      }),
      this.prisma.vehicleBooking.count({ where }),
    ]);
    return { data: items, total, page: params?.skip ? Math.floor(params.skip / (params.take ?? 10)) + 1 : 1, pageSize: params?.take ?? 10 };
  }

  async findOne(id: string) {
    const item = await this.prisma.vehicleBooking.findUnique({
      where: { id },
      include: { branch: true },
    });
    if (!item) throw new NotFoundException('Vehicle booking not found');
    return item;
  }

  async updateStatus(id: string, status: string, userId: string) {
    await this.findOne(id);
    return this.prisma.vehicleBooking.update({
      where: { id },
      data: { status, updatedBy: userId },
    });
  }
}
