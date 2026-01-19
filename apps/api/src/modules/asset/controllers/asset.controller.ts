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
import { AssetService } from '../services/asset.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateAssetDto {
  assetCode: string;
  name: string;
  description?: string;
  categoryId: string;
  acquisitionDate: Date;
  acquisitionCost: number;
  depreciationMethodId: string;
  usefulLife: number;
  salvageValue: number;
  status?: string;
}

class UpdateAssetDto {
  name?: string;
  description?: string;
  status?: string;
  usefulLife?: number;
  salvageValue?: number;
}

class RecordDepreciationDto {
  amount: number;
}

@ApiTags('asset')
@ApiBearerAuth()
@Controller('assets')
export class AssetController {
  constructor(private assetService: AssetService) {}

  @Post()
  @RequirePermissions('asset:asset:create')
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  async create(
    @Body() createDto: CreateAssetDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.assetService.create(organizationId, branchId, createDto, userId);
  }

  @Get()
  @RequirePermissions('asset:asset:read')
  @ApiOperation({ summary: 'Get all assets' })
  @ApiResponse({ status: 200, description: 'List of assets' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.assetService.findAll(organizationId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      categoryId,
      branchId,
      status,
    });
  }

  @Get('summary')
  @RequirePermissions('asset:asset:read')
  @ApiOperation({ summary: 'Get asset summary' })
  @ApiResponse({ status: 200, description: 'Asset summary' })
  async getSummary(@CurrentUser('organizationId') organizationId: string) {
    return this.assetService.getSummary(organizationId);
  }

  @Get(':id')
  @RequirePermissions('asset:asset:read')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.assetService.findOne(id, organizationId);
  }

  @Put(':id')
  @RequirePermissions('asset:asset:update')
  @ApiOperation({ summary: 'Update asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssetDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.assetService.update(id, organizationId, updateDto, userId);
  }

  @Post(':id/depreciate')
  @RequirePermissions('asset:asset:depreciate')
  @ApiOperation({ summary: 'Record depreciation for asset' })
  @ApiResponse({ status: 200, description: 'Depreciation recorded successfully' })
  async recordDepreciation(
    @Param('id') id: string,
    @Body() dto: RecordDepreciationDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.assetService.recordDepreciation(id, organizationId, dto.amount, userId);
  }

  @Post(':id/dispose')
  @RequirePermissions('asset:asset:update')
  @ApiOperation({ summary: 'Dispose asset' })
  @ApiResponse({ status: 200, description: 'Asset disposed successfully' })
  async dispose(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.assetService.dispose(id, organizationId, userId);
  }

  @Delete(':id')
  @RequirePermissions('asset:asset:delete')
  @ApiOperation({ summary: 'Delete asset' })
  @ApiResponse({ status: 200, description: 'Asset deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.assetService.delete(id, organizationId);
  }
}
