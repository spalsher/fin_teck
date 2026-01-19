import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { CustomerService } from '../services/customer.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateCustomerDto {
  @IsString()
  customerCode: string;

  @IsString()
  name: string;

  @IsString()
  customerType: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsArray()
  contacts: Array<{
    name: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }>;

  @IsObject()
  billingAddress: any;

  @IsOptional()
  @IsObject()
  shippingAddress?: any;

  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @IsOptional()
  @IsNumber()
  paymentTermDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateCustomerDto {
  name?: string;
  taxId?: string;
  billingAddress?: any;
  shippingAddress?: any;
  creditLimit?: number;
  paymentTermDays?: number;
  isActive?: boolean;
  contacts?: Array<{
    id?: string;
    name: string;
    email: string;
    phone: string;
    isPrimary: boolean;
  }>;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('customers')
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @Post()
  @RequirePermissions('finance:customer:create')
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({ status: 201, description: 'Customer created successfully' })
  @ApiResponse({ status: 409, description: 'Customer code already exists' })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'customer.controller.ts:create:entry',message:'POST /customers called',data:{dto:createCustomerDto,branchId,userId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    
    try {
      const result = await this.customerService.create(branchId, createCustomerDto, userId);
      
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'customer.controller.ts:create:success',message:'Customer created',data:{customerId:result.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      
      return result;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'customer.controller.ts:create:error',message:'Customer creation failed',data:{error:error.message,stack:error.stack,dto:createCustomerDto},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  @Get()
  @RequirePermissions('finance:customer:read')
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'customerType', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('customerType') customerType?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.customerService.findAll(branchId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      customerType,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('finance:customer:read')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, description: 'Customer details' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(id);
  }

  @Get(':id/balance')
  @RequirePermissions('finance:customer:read')
  @ApiOperation({ summary: 'Get customer balance' })
  @ApiResponse({ status: 200, description: 'Customer balance' })
  async getBalance(@Param('id') id: string) {
    return this.customerService.getBalance(id);
  }

  @Put(':id')
  @RequirePermissions('finance:customer:update')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.customerService.update(id, updateCustomerDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('finance:customer:delete')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete customer with transactions' })
  async delete(@Param('id') id: string) {
    return this.customerService.delete(id);
  }
}
