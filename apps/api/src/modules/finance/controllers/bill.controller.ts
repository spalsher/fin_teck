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
import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { BillService } from '../services/bill.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateBillDto {
  @IsString()
  vendorId: string;

  @Type(() => Date)
  @IsDate()
  billDate: Date;

  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @IsNumber()
  totalAmount: number;
}

class UpdateBillDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  billDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  totalAmount?: number;
}

class RecordPaymentDto {
  @IsNumber()
  amount: number;

  @Type(() => Date)
  @IsDate()
  paymentDate: Date;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('bills')
export class BillController {
  constructor(private billService: BillService) {}

  @Post()
  @RequirePermissions('finance:bill:create')
  @ApiOperation({ summary: 'Create a new bill' })
  @ApiResponse({ status: 201, description: 'Bill created successfully' })
  async create(
    @Body() createBillDto: CreateBillDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billService.create(branchId, createBillDto, userId);
  }

  @Get()
  @RequirePermissions('finance:bill:read')
  @ApiOperation({ summary: 'Get all bills' })
  @ApiResponse({ status: 200, description: 'List of bills' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'vendorId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('vendorId') vendorId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.billService.findAll(branchId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      vendorId,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('finance:bill:read')
  @ApiOperation({ summary: 'Get bill by ID' })
  @ApiResponse({ status: 200, description: 'Bill details' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async findOne(@Param('id') id: string) {
    return this.billService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions('finance:bill:update')
  @ApiOperation({ summary: 'Update bill' })
  @ApiResponse({ status: 200, description: 'Bill updated successfully' })
  @ApiResponse({ status: 400, description: 'Only draft bills can be updated' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async update(
    @Param('id') id: string,
    @Body() updateBillDto: UpdateBillDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.billService.update(id, updateBillDto, userId);
  }

  @Post(':id/post')
  @RequirePermissions('finance:bill:post')
  @ApiOperation({ summary: 'Post bill' })
  @ApiResponse({ status: 200, description: 'Bill posted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft bills can be posted' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async post(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billService.post(id, userId);
  }

  @Post(':id/void')
  @RequirePermissions('finance:bill:update')
  @ApiOperation({ summary: 'Void bill' })
  @ApiResponse({ status: 200, description: 'Bill voided successfully' })
  @ApiResponse({ status: 400, description: 'Cannot void this bill' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async void(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.billService.void(id, userId);
  }

  @Post(':id/payment')
  @RequirePermissions('finance:bill:update')
  @ApiOperation({ summary: 'Record payment for bill' })
  @ApiResponse({ status: 200, description: 'Payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Cannot record payment' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async recordPayment(
    @Param('id') id: string,
    @Body() recordPaymentDto: RecordPaymentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.billService.recordPayment(id, recordPaymentDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('finance:bill:delete')
  @ApiOperation({ summary: 'Delete bill' })
  @ApiResponse({ status: 200, description: 'Bill deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft bills can be deleted' })
  @ApiResponse({ status: 404, description: 'Bill not found' })
  async delete(@Param('id') id: string) {
    return this.billService.delete(id);
  }
}
