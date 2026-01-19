import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../../shared/database/prisma.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';

@ApiTags('core')
@ApiBearerAuth()
@Controller('activity')
export class ActivityController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get global activity feed' })
  @ApiResponse({ status: 200, description: 'Activity feed retrieved' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'entity', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  async getGlobalActivity(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
  ) {
    const where: any = {};
    
    if (userId) where.userId = userId;
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const activities = await this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : 50,
      skip: offset ? parseInt(offset) : 0,
    });

    return activities;
  }

  @Get(':entity/:id')
  @ApiOperation({ summary: 'Get activity for specific entity' })
  @ApiResponse({ status: 200, description: 'Entity activity retrieved' })
  async getEntityActivity(
    @Param('entity') entity: string,
    @Param('id') id: string,
  ) {
    const activities = await this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return activities;
  }

  @Get('user/recent')
  @ApiOperation({ summary: 'Get current user recent activity' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved' })
  async getUserRecentActivity(@CurrentUser('id') userId: string) {
    const activities = await this.prisma.auditLog.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return activities;
  }
}
