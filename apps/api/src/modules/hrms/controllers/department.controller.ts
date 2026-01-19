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
import { DepartmentService } from '../services/department.service';
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

class CreateDepartmentDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateDepartmentDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  managerId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  costCenterId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('hrms/departments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @RequirePermissions('HRMS_DEPARTMENT_CREATE')
  async create(@Request() req, @Body() createDto: CreateDepartmentDto) {
    return this.departmentService.create(
      req.user.organizationId,
      createDto,
      req.user.userId,
    );
  }

  @Get()
  @RequirePermissions('HRMS_DEPARTMENT_READ')
  async findAll(@Request() req, @Query() query: any) {
    return this.departmentService.findAll(req.user.organizationId, {
      branchId: query.branchId,
      search: query.search,
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
      skip: query.page ? (parseInt(query.page) - 1) * (parseInt(query.pageSize) || 50) : 0,
      take: query.pageSize ? parseInt(query.pageSize) : 50,
    });
  }

  @Get('hierarchy')
  @RequirePermissions('HRMS_DEPARTMENT_READ')
  async getHierarchy(@Request() req, @Query('branchId') branchId?: string) {
    return this.departmentService.getHierarchy(req.user.organizationId, branchId);
  }

  @Get(':id')
  @RequirePermissions('HRMS_DEPARTMENT_READ')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.departmentService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  @RequirePermissions('HRMS_DEPARTMENT_UPDATE')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateDepartmentDto,
  ) {
    return this.departmentService.update(
      id,
      req.user.organizationId,
      updateDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @RequirePermissions('HRMS_DEPARTMENT_DELETE')
  async delete(@Request() req, @Param('id') id: string) {
    return this.departmentService.delete(id, req.user.organizationId);
  }
}
