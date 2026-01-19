import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ChartOfAccountService } from '../services/chart-of-account.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateChartOfAccountDto {
  accountCode: string;
  accountName: string;
  accountType: string;
  accountCategory: string;
  parentId?: string;
  level: number;
  isControlAccount?: boolean;
  allowDirectPosting?: boolean;
  isActive?: boolean;
}

class UpdateChartOfAccountDto {
  accountName?: string;
  accountCategory?: string;
  allowDirectPosting?: boolean;
  isActive?: boolean;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('chart-of-accounts')
export class ChartOfAccountController {
  constructor(private chartOfAccountService: ChartOfAccountService) {}

  @Post()
  @RequirePermissions('finance:chart-of-account:create')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async create(
    @Body() createDto: CreateChartOfAccountDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chartOfAccountService.create(organizationId, createDto, userId);
  }

  @Get()
  @RequirePermissions('finance:chart-of-account:read')
  @ApiOperation({ summary: 'Get all accounts' })
  @ApiResponse({ status: 200, description: 'List of accounts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'accountType', required: false, type: String })
  @ApiQuery({ name: 'accountCategory', required: false, type: String })
  @ApiQuery({ name: 'parentId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('accountType') accountType?: string,
    @Query('accountCategory') accountCategory?: string,
    @Query('parentId') parentId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.chartOfAccountService.findAll(organizationId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      accountType,
      accountCategory,
      parentId,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get('hierarchy')
  @RequirePermissions('finance:chart-of-account:read')
  @ApiOperation({ summary: 'Get account hierarchy' })
  @ApiResponse({ status: 200, description: 'Account hierarchy' })
  async getHierarchy(@CurrentUser('organizationId') organizationId: string) {
    return this.chartOfAccountService.getHierarchy(organizationId);
  }

  @Get(':id')
  @RequirePermissions('finance:chart-of-account:read')
  @ApiOperation({ summary: 'Get account by ID' })
  @ApiResponse({ status: 200, description: 'Account details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.chartOfAccountService.findOne(id, organizationId);
  }

  @Put(':id')
  @RequirePermissions('finance:chart-of-account:update')
  @ApiOperation({ summary: 'Update account' })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateChartOfAccountDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.chartOfAccountService.update(id, organizationId, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('finance:chart-of-account:delete')
  @ApiOperation({ summary: 'Delete account' })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.chartOfAccountService.delete(id, organizationId);
  }
}
