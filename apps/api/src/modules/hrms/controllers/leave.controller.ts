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
import { LeaveService } from '../services/leave.service';
import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== LEAVE TYPE DTOs ====================

class CreateLeaveTypeDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  isPaid: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDaysPerYear?: number;

  @IsOptional()
  @IsBoolean()
  carryForward?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxCarryForward?: number;

  @IsOptional()
  @IsBoolean()
  encashable?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresDoc?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  accrualRate?: number;

  @IsOptional()
  @IsString()
  applicableGender?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minServiceMonths?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateLeaveTypeDto {
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
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDaysPerYear?: number;

  @IsOptional()
  @IsBoolean()
  carryForward?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxCarryForward?: number;

  @IsOptional()
  @IsBoolean()
  encashable?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresDoc?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  accrualRate?: number;

  @IsOptional()
  @IsString()
  applicableGender?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minServiceMonths?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ==================== LEAVE REQUEST DTOs ====================

class CreateLeaveRequestDto {
  @IsString()
  leaveTypeId: string;

  @IsDateString()
  fromDate: string;

  @IsDateString()
  toDate: string;

  @IsNumber()
  @Type(() => Number)
  days: number;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  contactDuring?: string;

  @IsOptional()
  @IsString()
  document?: string;
}

class ReviewLeaveRequestDto {
  @IsString()
  notes: string;
}

class AccrueLeaveDto {
  @IsString()
  employeeId: string;

  @IsString()
  leaveTypeId: string;

  @IsNumber()
  @Type(() => Number)
  year: number;

  @IsNumber()
  @Type(() => Number)
  days: number;
}

// ==================== CONTROLLERS ====================

@Controller('hrms/leave-types')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveTypeController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @RequirePermissions('HRMS_LEAVE_TYPE_CREATE')
  async create(@Request() req, @Body() createDto: CreateLeaveTypeDto) {
    return this.leaveService.createLeaveType(req.user.organizationId, createDto);
  }

  @Get()
  @RequirePermissions('HRMS_LEAVE_TYPE_READ')
  async findAll(@Request() req, @Query() query: any) {
    return this.leaveService.findAllLeaveTypes(req.user.organizationId, {
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
      search: query.search,
    });
  }

  @Get(':id')
  @RequirePermissions('HRMS_LEAVE_TYPE_READ')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.leaveService.findOneLeaveType(id, req.user.organizationId);
  }

  @Put(':id')
  @RequirePermissions('HRMS_LEAVE_TYPE_UPDATE')
  async update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateLeaveTypeDto) {
    return this.leaveService.updateLeaveType(id, req.user.organizationId, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('HRMS_LEAVE_TYPE_UPDATE')
  async delete(@Request() req, @Param('id') id: string) {
    return this.leaveService.deleteLeaveType(id, req.user.organizationId);
  }
}

@Controller('hrms/leave-balances')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveBalanceController {
  constructor(private readonly leaveService: LeaveService) {}

  @Get('employee/:employeeId')
  @RequirePermissions('HRMS_LEAVE_BALANCE_READ')
  async getEmployeeBalances(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getEmployeeLeaveBalances(
      employeeId,
      year ? parseInt(year) : undefined,
    );
  }

  @Post('initialize')
  @RequirePermissions('HRMS_LEAVE_BALANCE_READ')
  async initializeBalances(
    @Request() req,
    @Body() body: { employeeId: string; year: number },
  ) {
    return this.leaveService.initializeLeaveBalances(
      body.employeeId,
      req.user.organizationId,
      body.year,
    );
  }

  @Post('accrue')
  @RequirePermissions('HRMS_LEAVE_BALANCE_READ')
  async accrueLeaves(@Request() req, @Body() accrueDto: AccrueLeaveDto) {
    return this.leaveService.accrueLeaves(
      accrueDto.employeeId,
      accrueDto.leaveTypeId,
      accrueDto.year,
      accrueDto.days,
    );
  }
}

@Controller('hrms/leave-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class LeaveRequestController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  @RequirePermissions('HRMS_LEAVE_REQUEST_CREATE')
  async create(@Request() req, @Body() createDto: CreateLeaveRequestDto) {
    // If user is applying for themselves, use their employee ID
    // Otherwise, admin can apply on behalf of others
    const employeeId = req.body.employeeId || req.user.employeeId;
    return this.leaveService.createLeaveRequest(employeeId, createDto);
  }

  @Get()
  @RequirePermissions('HRMS_LEAVE_REQUEST_READ')
  async findAll(@Request() req, @Query() query: any) {
    return this.leaveService.findAllLeaveRequests(req.user.organizationId, {
      employeeId: query.employeeId,
      departmentId: query.departmentId,
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate,
      skip: query.page ? (parseInt(query.page) - 1) * (parseInt(query.pageSize) || 50) : 0,
      take: query.pageSize ? parseInt(query.pageSize) : 50,
    });
  }

  @Get('calendar')
  @RequirePermissions('HRMS_LEAVE_REQUEST_READ')
  async getCalendar(
    @Request() req,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.leaveService.getLeaveCalendar(
      req.user.organizationId,
      new Date(fromDate),
      new Date(toDate),
      departmentId,
    );
  }

  @Get(':id')
  @RequirePermissions('HRMS_LEAVE_REQUEST_READ')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.leaveService.findOneLeaveRequest(id, req.user.organizationId);
  }

  @Put(':id/approve')
  @RequirePermissions('HRMS_LEAVE_REQUEST_APPROVE')
  async approve(@Request() req, @Param('id') id: string, @Body() reviewDto: ReviewLeaveRequestDto) {
    return this.leaveService.approveLeaveRequest(
      id,
      req.user.organizationId,
      req.user.userId,
      reviewDto.notes,
    );
  }

  @Put(':id/reject')
  @RequirePermissions('HRMS_LEAVE_REQUEST_APPROVE')
  async reject(@Request() req, @Param('id') id: string, @Body() reviewDto: ReviewLeaveRequestDto) {
    return this.leaveService.rejectLeaveRequest(
      id,
      req.user.organizationId,
      req.user.userId,
      reviewDto.notes,
    );
  }

  @Put(':id/cancel')
  @RequirePermissions('HRMS_LEAVE_REQUEST_CANCEL')
  async cancel(@Request() req, @Param('id') id: string) {
    const employeeId = req.user.employeeId;
    return this.leaveService.cancelLeaveRequest(id, employeeId, req.user.organizationId);
  }
}
