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
import { ProductionOrderService } from '../services/production-order.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateProductionOrderDto {
  bomId: string;
  plannedQty: number;
  plannedStart: Date;
  plannedEnd: Date;
  warehouseId: string;
  status?: string;
}

class RecordProductionDto {
  quantity: number;
}

@ApiTags('manufacturing')
@ApiBearerAuth()
@Controller('production-orders')
export class ProductionOrderController {
  constructor(private productionOrderService: ProductionOrderService) {}

  @Post()
  @RequirePermissions('manufacturing:production:create')
  @ApiOperation({ summary: 'Create a new production order' })
  @ApiResponse({ status: 201, description: 'Production order created successfully' })
  async create(
    @Body() createDto: CreateProductionOrderDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productionOrderService.create(branchId, createDto, userId);
  }

  @Get()
  @RequirePermissions('manufacturing:production:read')
  @ApiOperation({ summary: 'Get all production orders' })
  @ApiResponse({ status: 200, description: 'List of production orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.productionOrderService.findAll(branchId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      status,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('manufacturing:production:read')
  @ApiOperation({ summary: 'Get production order by ID' })
  @ApiResponse({ status: 200, description: 'Production order details' })
  async findOne(@Param('id') id: string) {
    return this.productionOrderService.findOne(id);
  }

  @Post(':id/start')
  @RequirePermissions('manufacturing:production:update')
  @ApiOperation({ summary: 'Start production order' })
  @ApiResponse({ status: 200, description: 'Production order started successfully' })
  async start(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productionOrderService.start(id, userId);
  }

  @Post(':id/record-production')
  @RequirePermissions('manufacturing:production:update')
  @ApiOperation({ summary: 'Record production quantity' })
  @ApiResponse({ status: 200, description: 'Production recorded successfully' })
  async recordProduction(
    @Param('id') id: string,
    @Body() dto: RecordProductionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.productionOrderService.recordProduction(id, dto.quantity, userId);
  }

  @Post(':id/cancel')
  @RequirePermissions('manufacturing:production:update')
  @ApiOperation({ summary: 'Cancel production order' })
  @ApiResponse({ status: 200, description: 'Production order cancelled successfully' })
  async cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.productionOrderService.cancel(id, userId);
  }

  @Delete(':id')
  @RequirePermissions('manufacturing:production:delete')
  @ApiOperation({ summary: 'Delete production order' })
  @ApiResponse({ status: 200, description: 'Production order deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.productionOrderService.delete(id);
  }
}
