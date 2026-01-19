import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from '../services/dashboard.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

@ApiTags('reporting')
@ApiBearerAuth()
@Controller('reporting/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('overall')
  @RequirePermissions('reporting:dashboard:read')
  @ApiOperation({ summary: 'Get overall dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Dashboard metrics' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getOverallDashboard(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    return this.dashboardService.getOverallDashboard(organizationId, branchId, dateRange);
  }

  @Get('finance')
  @RequirePermissions('reporting:dashboard:read')
  @ApiOperation({ summary: 'Get finance dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Finance metrics' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getFinanceDashboard(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateRange =
      startDate && endDate
        ? {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          }
        : undefined;

    return this.dashboardService.getFinanceDashboard(organizationId, branchId, dateRange);
  }

  @Get('scm')
  @RequirePermissions('reporting:dashboard:read')
  @ApiOperation({ summary: 'Get SCM dashboard metrics' })
  @ApiResponse({ status: 200, description: 'SCM metrics' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  async getSCMDashboard(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.dashboardService.getSCMDashboard(organizationId, branchId);
  }

  @Get('assets')
  @RequirePermissions('reporting:dashboard:read')
  @ApiOperation({ summary: 'Get Asset dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Asset metrics' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  async getAssetDashboard(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.dashboardService.getAssetDashboard(organizationId, branchId);
  }

  @Get('hrms')
  @RequirePermissions('reporting:dashboard:read')
  @ApiOperation({ summary: 'Get HRMS dashboard metrics' })
  @ApiResponse({ status: 200, description: 'HRMS metrics' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  async getHRMSDashboard(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.dashboardService.getHRMSDashboard(organizationId, branchId);
  }

  @Get('manufacturing')
  @RequirePermissions('reporting:dashboard:read')
  @ApiOperation({ summary: 'Get Manufacturing dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Manufacturing metrics' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  async getManufacturingDashboard(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.dashboardService.getManufacturingDashboard(organizationId, branchId);
  }
}
