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
import { WarehouseService } from '../services/warehouse.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateWarehouseDto {
  warehouseCode: string;
  name: string;
  address: any;
  isActive?: boolean;
}

class UpdateWarehouseDto {
  name?: string;
  address?: any;
  isActive?: boolean;
}

@ApiTags('scm')
@ApiBearerAuth()
@Controller('warehouses')
export class WarehouseController {
  constructor(private warehouseService: WarehouseService) {}

  @Post()
  @RequirePermissions('scm:warehouse:create')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  async create(
    @Body() createDto: CreateWarehouseDto,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.warehouseService.create(branchId, createDto);
  }

  @Get()
  @RequirePermissions('scm:warehouse:read')
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiResponse({ status: 200, description: 'List of warehouses' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.warehouseService.findAll(branchId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('scm:warehouse:read')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiResponse({ status: 200, description: 'Warehouse details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.warehouseService.findOne(id, branchId);
  }

  @Put(':id')
  @RequirePermissions('scm:warehouse:update')
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWarehouseDto,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.warehouseService.update(id, branchId, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('scm:warehouse:delete')
  @ApiOperation({ summary: 'Delete warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('branchId') branchId: string,
  ) {
    return this.warehouseService.delete(id, branchId);
  }
}
