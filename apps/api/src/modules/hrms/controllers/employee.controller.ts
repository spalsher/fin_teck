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
import { IsString, IsOptional, IsEmail, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { EmployeeService } from '../services/employee.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';

class CreateEmployeeDto {
  @IsString()
  employeeCode: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @Type(() => Date)
  @IsDate()
  hireDate: Date;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  designationId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  designationId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  terminationDate?: Date;
}

@ApiTags('hrms')
@ApiBearerAuth()
@Controller('employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  @RequirePermissions('hrms:employee:create')
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  async create(
    @Body() createDto: CreateEmployeeDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.employeeService.create(organizationId, branchId, createDto, userId);
  }

  @Get()
  @RequirePermissions('hrms:employee:read')
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'List of employees' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'branchId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.employeeService.findAll(organizationId, {
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      search,
      branchId,
      status,
    });
  }

  @Get('summary')
  @RequirePermissions('hrms:employee:read')
  @ApiOperation({ summary: 'Get employee summary' })
  @ApiResponse({ status: 200, description: 'Employee summary' })
  async getSummary(@CurrentUser('organizationId') organizationId: string) {
    return this.employeeService.getSummary(organizationId);
  }

  @Get(':id')
  @RequirePermissions('hrms:employee:read')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee details' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.employeeService.findOne(id, organizationId);
  }

  @Put(':id')
  @RequirePermissions('hrms:employee:update')
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.employeeService.update(id, organizationId, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions('hrms:employee:delete')
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.employeeService.delete(id, organizationId);
  }
}
