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
import { IsString, IsOptional, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceService } from '../services/invoice.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateInvoiceDto {
  @IsString()
  customerId: string;

  @Type(() => Date)
  @IsDate()
  invoiceDate: Date;

  @Type(() => Date)
  @IsDate()
  dueDate: Date;

  @IsString()
  invoiceType: string;

  @IsOptional()
  @IsString()
  externalRef?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  lines: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    itemId?: string;
  }>;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Post()
  @RequirePermissions('finance:invoice:create')
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invoiceService.create(branchId, createInvoiceDto, userId);
  }

  @Get()
  @RequirePermissions('finance:invoice:read')
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.invoiceService.findAll(branchId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      customerId,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('finance:invoice:read')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Post(':id/post')
  @RequirePermissions('finance:invoice:post')
  @ApiOperation({ summary: 'Post invoice' })
  @ApiResponse({ status: 200, description: 'Invoice posted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be posted' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async post(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invoiceService.post(id, userId);
  }

  @Post(':id/void')
  @RequirePermissions('finance:invoice:update')
  @ApiOperation({ summary: 'Void invoice' })
  @ApiResponse({ status: 200, description: 'Invoice voided successfully' })
  @ApiResponse({ status: 400, description: 'Cannot void this invoice' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async void(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.invoiceService.void(id, userId);
  }

  @Delete(':id')
  @RequirePermissions('finance:invoice:delete')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft invoices can be deleted' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async delete(@Param('id') id: string) {
    return this.invoiceService.delete(id);
  }
}
