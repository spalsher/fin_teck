import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionService } from '../services/permission.service';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';

@ApiTags('auth')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_READ)
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved' })
  async findAll() {
    return this.permissionService.findAll();
  }

  @Get('grouped')
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_READ)
  @ApiOperation({ summary: 'Get permissions grouped by module and entity' })
  @ApiResponse({ status: 200, description: 'Grouped permissions retrieved' })
  async getGrouped() {
    return this.permissionService.getGroupedPermissions();
  }

  @Post('seed')
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_CREATE)
  @ApiOperation({ summary: 'Seed permissions from constants' })
  @ApiResponse({ status: 200, description: 'Permissions seeded' })
  async seed() {
    return this.permissionService.seedPermissions();
  }
}
