import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../../shared/guards/permissions.guard';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { DesignationService } from '../services/designation.service';
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class CreateDesignationDto {
  @IsString()
  code: string;

  @IsString()
  title: string;

  @IsNumber()
  @Type(() => Number)
  level: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salaryBandMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salaryBandMax?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  responsibilities?: any;

  @IsOptional()
  requirements?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateDesignationDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  level?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salaryBandMin?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  salaryBandMax?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  responsibilities?: any;

  @IsOptional()
  requirements?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('hrms/designations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DesignationController {
  constructor(private readonly designationService: DesignationService) {}

  @Post()
  @RequirePermissions('HRMS_DESIGNATION_CREATE')
  async create(@Request() req, @Body() createDto: CreateDesignationDto) {
    return this.designationService.create(req.user.organizationId, createDto);
  }

  @Get()
  @RequirePermissions('HRMS_DESIGNATION_READ')
  async findAll(@Request() req, @Query() query: any) {
    return this.designationService.findAll(req.user.organizationId, {
      search: query.search,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
      level: query.level,
      skip: query.page ? (parseInt(query.page) - 1) * (parseInt(query.pageSize) || 50) : 0,
      take: query.pageSize ? parseInt(query.pageSize) : 50,
    });
  }

  @Get('levels')
  @RequirePermissions('HRMS_DESIGNATION_READ')
  async getLevels(@Request() req) {
    return this.designationService.getLevels(req.user.organizationId);
  }

  @Get(':id')
  @RequirePermissions('HRMS_DESIGNATION_READ')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.designationService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  @RequirePermissions('HRMS_DESIGNATION_UPDATE')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateDesignationDto,
  ) {
    return this.designationService.update(id, req.user.organizationId, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('HRMS_DESIGNATION_DELETE')
  async delete(@Request() req, @Param('id') id: string) {
    return this.designationService.delete(id, req.user.organizationId);
  }
}
