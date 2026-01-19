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
import { PurchaseOrderService } from '../services/purchase-order.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreatePurchaseOrderDto {
  vendorId: string;
  orderDate: Date;
  expectedDate?: Date;
  notes?: string;
  lines: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

@ApiTags('scm')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private purchaseOrderService: PurchaseOrderService) {}

  @Post()
  @RequirePermissions('scm:po:create')
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  async create(
    @Body() createDto: CreatePurchaseOrderDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.purchaseOrderService.create(branchId, createDto, userId);
  }

  @Get()
  @RequirePermissions('scm:po:read')
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'List of purchase orders' })
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

    return this.purchaseOrderService.findAll(branchId, {
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
  @RequirePermissions('scm:po:read')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase order details' })
  async findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  @Post(':id/approve')
  @RequirePermissions('scm:po:approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order approved successfully' })
  async approve(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.purchaseOrderService.approve(id, userId);
  }

  @Post(':id/cancel')
  @RequirePermissions('scm:po:update')
  @ApiOperation({ summary: 'Cancel purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order cancelled successfully' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.purchaseOrderService.cancel(id, userId);
  }

  @Delete(':id')
  @RequirePermissions('scm:po:delete')
  @ApiOperation({ summary: 'Delete purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.purchaseOrderService.delete(id);
  }
}
