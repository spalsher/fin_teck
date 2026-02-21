import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GlReportsService } from '../services/gl-reports.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('finance/reports')
export class GlReportsController {
  constructor(private glReportsService: GlReportsService) {}

  @Get('trial-balance')
  @RequirePermissions(PERMISSIONS.REPORT_FINANCIAL_READ)
  @ApiOperation({ summary: 'Trial balance report' })
  @ApiResponse({ status: 200, description: 'Trial balance rows' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: true, type: String })
  @ApiQuery({ name: 'toDate', required: true, type: String })
  async getTrialBalance(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    if (!fromDate || !toDate) {
      return { rows: [], fromDate: null, toDate: null };
    }
    return this.glReportsService.getTrialBalance(organizationId, {
      branchId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    });
  }

  @Get('audit-trial')
  @RequirePermissions(PERMISSIONS.REPORT_FINANCIAL_READ)
  @ApiOperation({ summary: 'Audit trial report' })
  @ApiResponse({ status: 200, description: 'Audit trial rows' })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: true, type: String })
  @ApiQuery({ name: 'toDate', required: true, type: String })
  @ApiQuery({ name: 'accountId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getAuditTrial(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('accountId') accountId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    if (!fromDate || !toDate) {
      return { rows: [], total: 0 };
    }
    return this.glReportsService.getAuditTrial(organizationId, {
      branchId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      accountId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('account-ledger')
  @RequirePermissions(PERMISSIONS.REPORT_FINANCIAL_READ)
  @ApiOperation({ summary: 'Account ledger report' })
  @ApiResponse({ status: 200, description: 'Account ledger rows' })
  @ApiQuery({ name: 'accountId', required: true, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: true, type: String })
  @ApiQuery({ name: 'toDate', required: true, type: String })
  async getAccountLedger(
    @CurrentUser('organizationId') organizationId: string,
    @Query('accountId') accountId: string,
    @Query('branchId') branchId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    if (!accountId || !fromDate || !toDate) {
      return {
        rows: [],
        accountCode: '',
        accountName: '',
        fromDate: fromDate ? new Date(fromDate) : new Date(),
        toDate: toDate ? new Date(toDate) : new Date(),
      };
    }
    return this.glReportsService.getAccountLedger(organizationId, {
      accountId,
      branchId,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
    });
  }
}
