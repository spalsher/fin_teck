import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../../shared/database/prisma.service';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @RequirePermissions('hrms:employee:read')
  @ApiOperation({ summary: 'List users in the organization (for Administration)' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async list(@Request() req: { user: { organizationId: string } }) {
    const users = await this.prisma.user.findMany({
      where: { organizationId: req.user.organizationId, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        employeeId: true,
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    });
    return users;
  }
}
