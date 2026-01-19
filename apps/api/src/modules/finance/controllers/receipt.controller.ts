import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ReceiptService } from '../services/receipt.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateReceiptDto {
  customerId: string;
  receiptDate: Date;
  amount: number;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  allocations: Array<{
    invoiceId: string;
    amount: number;
  }>;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('receipts')
export class ReceiptController {
  constructor(private receiptService: ReceiptService) {}

  @Post()
  @RequirePermissions('finance:receipt:create')
  @ApiOperation({ summary: 'Create a new receipt' })
  @ApiResponse({ status: 201, description: 'Receipt created successfully' })
  async create(
    @Body() createReceiptDto: CreateReceiptDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.receiptService.create(branchId, createReceiptDto, userId);
  }

  @Get()
  @RequirePermissions('finance:receipt:read')
  @ApiOperation({ summary: 'Get all receipts' })
  @ApiResponse({ status: 200, description: 'List of receipts' })
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

    return this.receiptService.findAll(branchId, {
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
  @RequirePermissions('finance:receipt:read')
  @ApiOperation({ summary: 'Get receipt by ID' })
  @ApiResponse({ status: 200, description: 'Receipt details' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  async findOne(@Param('id') id: string) {
    return this.receiptService.findOne(id);
  }

  @Post(':id/post')
  @RequirePermissions('finance:receipt:post')
  @ApiOperation({ summary: 'Post receipt' })
  @ApiResponse({ status: 200, description: 'Receipt posted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft receipts can be posted' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  async post(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.receiptService.post(id, userId);
  }

  @Post(':id/void')
  @RequirePermissions('finance:receipt:update')
  @ApiOperation({ summary: 'Void receipt' })
  @ApiResponse({ status: 200, description: 'Receipt voided successfully' })
  @ApiResponse({ status: 400, description: 'Cannot void this receipt' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  async void(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.receiptService.void(id, userId);
  }

  @Delete(':id')
  @RequirePermissions('finance:receipt:delete')
  @ApiOperation({ summary: 'Delete receipt' })
  @ApiResponse({ status: 200, description: 'Receipt deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only draft receipts can be deleted' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  async delete(@Param('id') id: string) {
    return this.receiptService.delete(id);
  }
}
