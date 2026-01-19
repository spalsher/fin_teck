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
import { BomService } from '../services/bom.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateBomDto {
  bomCode: string;
  name: string;
  finishedItemId: string;
  outputQty: number;
  outputUom: string;
  status?: string;
  lines: Array<{
    componentItemId: string;
    quantity: number;
    uom: string;
    wastagePercent?: number;
  }>;
}

@ApiTags('manufacturing')
@ApiBearerAuth()
@Controller('boms')
export class BomController {
  constructor(private bomService: BomService) {}

  @Post()
  @RequirePermissions('manufacturing:bom:create')
  @ApiOperation({ summary: 'Create a new BOM' })
  @ApiResponse({ status: 201, description: 'BOM created successfully' })
  async create(
    @Body() createDto: CreateBomDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bomService.create(organizationId, createDto, userId);
  }

  @Get()
  @RequirePermissions('manufacturing:bom:read')
  @ApiOperation({ summary: 'Get all BOMs' })
  @ApiResponse({ status: 200, description: 'List of BOMs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.bomService.findAll(organizationId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      status,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('manufacturing:bom:read')
  @ApiOperation({ summary: 'Get BOM by ID' })
  @ApiResponse({ status: 200, description: 'BOM details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.bomService.findOne(id, organizationId);
  }

  @Post(':id/approve')
  @RequirePermissions('manufacturing:bom:approve')
  @ApiOperation({ summary: 'Approve BOM' })
  @ApiResponse({ status: 200, description: 'BOM approved successfully' })
  async approve(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bomService.approve(id, organizationId, userId);
  }

  @Post(':id/deactivate')
  @RequirePermissions('manufacturing:bom:update')
  @ApiOperation({ summary: 'Deactivate BOM' })
  @ApiResponse({ status: 200, description: 'BOM deactivated successfully' })
  async deactivate(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.bomService.deactivate(id, organizationId, userId);
  }

  @Delete(':id')
  @RequirePermissions('manufacturing:bom:delete')
  @ApiOperation({ summary: 'Delete BOM' })
  @ApiResponse({ status: 200, description: 'BOM deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.bomService.delete(id, organizationId);
  }
}
