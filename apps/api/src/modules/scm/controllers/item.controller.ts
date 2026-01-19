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
import { ItemService } from '../services/item.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateItemDto {
  itemCode: string;
  name: string;
  description?: string;
  categoryId?: string;
  itemType: string;
  uom: string;
  unitCost: number;
  reorderLevel?: number;
  reorderQty?: number;
  isActive?: boolean;
  isHarnessComponent?: boolean;
}

class UpdateItemDto {
  name?: string;
  description?: string;
  categoryId?: string;
  uom?: string;
  unitCost?: number;
  reorderLevel?: number;
  reorderQty?: number;
  isActive?: boolean;
  isHarnessComponent?: boolean;
}

@ApiTags('scm')
@ApiBearerAuth()
@Controller('items')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @Post()
  @RequirePermissions('scm:item:create')
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  async create(
    @Body() createDto: CreateItemDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.itemService.create(organizationId, createDto, userId);
  }

  @Get()
  @RequirePermissions('scm:item:read')
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'List of items' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'itemType', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isHarnessComponent', required: false, type: Boolean })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('itemType') itemType?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
    @Query('isHarnessComponent') isHarnessComponent?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.itemService.findAll(organizationId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      itemType,
      categoryId,
      isActive: isActive ? isActive === 'true' : undefined,
      isHarnessComponent: isHarnessComponent ? isHarnessComponent === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('scm:item:read')
  @ApiOperation({ summary: 'Get item by ID' })
  @ApiResponse({ status: 200, description: 'Item details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.itemService.findOne(id, organizationId);
  }

  @Get(':id/stock-levels')
  @RequirePermissions('scm:item:read')
  @ApiOperation({ summary: 'Get item stock levels by warehouse' })
  @ApiResponse({ status: 200, description: 'Stock levels' })
  async getStockLevels(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.itemService.getStockLevels(id, organizationId);
  }

  @Put(':id')
  @RequirePermissions('scm:item:update')
  @ApiOperation({ summary: 'Update item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateItemDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.itemService.update(id, organizationId, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('scm:item:delete')
  @ApiOperation({ summary: 'Delete item' })
  @ApiResponse({ status: 200, description: 'Item deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.itemService.delete(id, organizationId);
  }
}
