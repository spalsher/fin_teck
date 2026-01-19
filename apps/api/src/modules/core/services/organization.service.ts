import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from '@iteck/shared';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        branches: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
        serviceOfferings: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, updateDto: UpdateOrganizationDto, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id },
      data: {
        ...updateDto,
      },
    });
  }
}
