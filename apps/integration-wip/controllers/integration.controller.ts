import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AutomatedBillingService } from '../services/automated-billing.service';
import { MockCrmAdapter } from '../adapters/mock-crm.adapter';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class RunBillingCycleDto {
  periodStart: Date;
  periodEnd: Date;
}

@ApiTags('integration')
@ApiBearerAuth()
@Controller('integration')
export class IntegrationController {
  constructor(
    private automatedBillingService: AutomatedBillingService,
    private crmAdapter: MockCrmAdapter,
  ) {}

  @Post('billing/run')
  @RequirePermissions('integration:billing:execute')
  @ApiOperation({ summary: 'Run automated billing cycle' })
  @ApiResponse({ status: 200, description: 'Billing cycle completed' })
  async runBillingCycle(
    @Body() dto: RunBillingCycleDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.automatedBillingService.runBillingCycle(
      branchId,
      organizationId,
      new Date(dto.periodStart),
      new Date(dto.periodEnd),
      userId,
    );
  }

  @Get('billing/history')
  @RequirePermissions('integration:billing:read')
  @ApiOperation({ summary: 'Get billing history' })
  @ApiResponse({ status: 200, description: 'Billing history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async getBillingHistory(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.automatedBillingService.getBillingHistory({
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      status,
    });
  }

  @Get('crm/test-connection')
  @RequirePermissions('integration:crm:read')
  @ApiOperation({ summary: 'Test CRM connection' })
  @ApiResponse({ status: 200, description: 'CRM connection status' })
  async testCrmConnection() {
    return this.crmAdapter.testConnection();
  }

  @Get('crm/customers')
  @RequirePermissions('integration:crm:read')
  @ApiOperation({ summary: 'Fetch customers from CRM' })
  @ApiResponse({ status: 200, description: 'List of CRM customers' })
  async getCrmCustomers() {
    return this.crmAdapter.getCustomers({ isActive: true });
  }

  @Get('crm/customer/:externalId')
  @RequirePermissions('integration:crm:read')
  @ApiOperation({ summary: 'Get customer from CRM by external ID' })
  @ApiResponse({ status: 200, description: 'CRM customer details' })
  async getCrmCustomer(@Query('externalId') externalId: string) {
    return this.crmAdapter.getCustomer(externalId);
  }

  @Get('crm/customer/:externalId/contracts')
  @RequirePermissions('integration:crm:read')
  @ApiOperation({ summary: 'Get customer contracts from CRM' })
  @ApiResponse({ status: 200, description: 'Customer contracts' })
  async getCrmCustomerContracts(@Query('externalId') externalId: string) {
    return this.crmAdapter.getCustomerContracts(externalId);
  }
}
