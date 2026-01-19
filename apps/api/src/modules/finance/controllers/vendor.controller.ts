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
import { IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { VendorService } from '../services/vendor.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateVendorDto {
  @IsString()
  vendorCode: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsObject()
  address: any;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  paymentTermDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateVendorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsObject()
  address?: any;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsNumber()
  paymentTermDays?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@ApiTags('finance')
@ApiBearerAuth()
@Controller('vendors')
export class VendorController {
  constructor(private vendorService: VendorService) {}

  @Post()
  @RequirePermissions('finance:vendor:create')
  @ApiOperation({ summary: 'Create a new vendor' })
  @ApiResponse({ status: 201, description: 'Vendor created successfully' })
  @ApiResponse({ status: 409, description: 'Vendor code already exists' })
  async create(
    @Body() createVendorDto: CreateVendorDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.vendorService.create(branchId, createVendorDto, userId);
  }

  @Get()
  @RequirePermissions('finance:vendor:read')
  @ApiOperation({ summary: 'Get all vendors' })
  @ApiResponse({ status: 200, description: 'List of vendors' })
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

    return this.vendorService.findAll(branchId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('finance:vendor:read')
  @ApiOperation({ summary: 'Get vendor by ID' })
  @ApiResponse({ status: 200, description: 'Vendor details' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async findOne(@Param('id') id: string) {
    return this.vendorService.findOne(id);
  }

  @Get(':id/balance')
  @RequirePermissions('finance:vendor:read')
  @ApiOperation({ summary: 'Get vendor balance' })
  @ApiResponse({ status: 200, description: 'Vendor balance' })
  async getBalance(@Param('id') id: string) {
    return this.vendorService.getBalance(id);
  }

  @Put(':id')
  @RequirePermissions('finance:vendor:update')
  @ApiOperation({ summary: 'Update vendor' })
  @ApiResponse({ status: 200, description: 'Vendor updated successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  async update(
    @Param('id') id: string,
    @Body() updateVendorDto: UpdateVendorDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.vendorService.update(id, updateVendorDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('finance:vendor:delete')
  @ApiOperation({ summary: 'Delete vendor' })
  @ApiResponse({ status: 200, description: 'Vendor deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vendor not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete vendor with transactions' })
  async delete(@Param('id') id: string) {
    return this.vendorService.delete(id);
  }
}
