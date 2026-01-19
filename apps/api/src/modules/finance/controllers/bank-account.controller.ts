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
import { BankAccountService } from '../services/bank-account.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateBankAccountDto {
  accountName: string;
  accountNumber: string;
  bankName: string;
  branchName?: string;
  iban?: string;
  swiftCode?: string;
  isActive?: boolean;
}

class UpdateBankAccountDto {
  accountName?: string;
  branchName?: string;
  iban?: string;
  swiftCode?: string;
  isActive?: boolean;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('bank-accounts')
export class BankAccountController {
  constructor(private bankAccountService: BankAccountService) {}

  @Post()
  @RequirePermissions('finance:bank-account:create')
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, description: 'Bank account created successfully' })
  async create(
    @Body() createDto: CreateBankAccountDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.bankAccountService.create(organizationId, createDto);
  }

  @Get()
  @RequirePermissions('finance:bank-account:read')
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, description: 'List of bank accounts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.bankAccountService.findAll(organizationId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('finance:bank-account:read')
  @ApiOperation({ summary: 'Get bank account by ID' })
  @ApiResponse({ status: 200, description: 'Bank account details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.bankAccountService.findOne(id, organizationId);
  }

  @Put(':id')
  @RequirePermissions('finance:bank-account:update')
  @ApiOperation({ summary: 'Update bank account' })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBankAccountDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.bankAccountService.update(id, organizationId, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('finance:bank-account:delete')
  @ApiOperation({ summary: 'Delete bank account' })
  @ApiResponse({ status: 200, description: 'Bank account deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.bankAccountService.delete(id, organizationId);
  }
}
