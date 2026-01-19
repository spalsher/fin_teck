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
import { AttendanceService } from '../services/attendance.service';
import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// ==================== SHIFT DTOs ====================

class CreateShiftDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsString()
  startTime: string; // HH:MM

  @IsString()
  endTime: string; // HH:MM

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  breakDuration?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  graceTime?: number;

  @IsOptional()
  weeklyOffs?: any;

  @IsOptional()
  @IsBoolean()
  isNightShift?: boolean;

  @IsOptional()
  overtimeRules?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class UpdateShiftDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  breakDuration?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  graceTime?: number;

  @IsOptional()
  weeklyOffs?: any;

  @IsOptional()
  @IsBoolean()
  isNightShift?: boolean;

  @IsOptional()
  overtimeRules?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

class AssignShiftDto {
  @IsString()
  employeeId: string;

  @IsString()
  shiftId: string;

  @IsDateString()
  fromDate: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

// ==================== ATTENDANCE DTOs ====================

class CheckInDto {
  @IsOptional()
  location?: any;

  @IsOptional()
  deviceInfo?: any;
}

class CheckOutDto {
  @IsOptional()
  location?: any;

  @IsOptional()
  deviceInfo?: any;
}

class MarkAbsentDto {
  @IsString()
  employeeId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class MarkLeaveDto {
  @IsString()
  employeeId: string;

  @IsDateString()
  date: string;
}

class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  workHours?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  overtimeHours?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

// ==================== OVERTIME DTOs ====================

class CreateOvertimeRequestDto {
  @IsDateString()
  date: string;

  @IsNumber()
  @Type(() => Number)
  hours: number;

  @IsString()
  reason: string;
}

class ReviewOvertimeDto {
  @IsString()
  notes: string;
}

// ==================== CONTROLLERS ====================

@Controller('hrms/shifts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @RequirePermissions('HRMS_SHIFT_CREATE')
  async create(@Request() req, @Body() createDto: CreateShiftDto) {
    return this.attendanceService.createShift(req.user.organizationId, createDto);
  }

  @Get()
  @RequirePermissions('HRMS_SHIFT_READ')
  async findAll(@Request() req, @Query() query: any) {
    return this.attendanceService.findAllShifts(req.user.organizationId, {
      isActive: query.isActive === 'true' ? true : query.isActive === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions('HRMS_SHIFT_READ')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.attendanceService.findOneShift(id, req.user.organizationId);
  }

  @Put(':id')
  @RequirePermissions('HRMS_SHIFT_UPDATE')
  async update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateShiftDto) {
    return this.attendanceService.updateShift(id, req.user.organizationId, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('HRMS_SHIFT_UPDATE')
  async delete(@Request() req, @Param('id') id: string) {
    return this.attendanceService.deleteShift(id, req.user.organizationId);
  }
}

@Controller('hrms/shift-assignments')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ShiftAssignmentController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @RequirePermissions('HRMS_SHIFT_UPDATE')
  async assignShift(@Request() req, @Body() assignDto: AssignShiftDto) {
    return this.attendanceService.assignShift(
      assignDto.employeeId,
      assignDto.shiftId,
      new Date(assignDto.fromDate),
      assignDto.toDate ? new Date(assignDto.toDate) : undefined,
    );
  }

  @Get('employee/:employeeId')
  @RequirePermissions('HRMS_SHIFT_READ')
  async getEmployeeShift(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('date') date?: string,
  ) {
    return this.attendanceService.getEmployeeShift(
      employeeId,
      date ? new Date(date) : new Date(),
    );
  }
}

@Controller('hrms/attendance')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @RequirePermissions('HRMS_ATTENDANCE_CREATE')
  async checkIn(@Request() req, @Body() checkInDto: CheckInDto) {
    const employeeId = req.user.employeeId;
    return this.attendanceService.checkIn(employeeId, checkInDto);
  }

  @Post('check-out')
  @RequirePermissions('HRMS_ATTENDANCE_CREATE')
  async checkOut(@Request() req, @Body() checkOutDto: CheckOutDto) {
    const employeeId = req.user.employeeId;
    return this.attendanceService.checkOut(employeeId, checkOutDto);
  }

  @Get()
  @RequirePermissions('HRMS_ATTENDANCE_READ')
  async findAll(@Request() req, @Query() query: any) {
    return this.attendanceService.findAllAttendance(req.user.organizationId, {
      employeeId: query.employeeId,
      departmentId: query.departmentId,
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate,
      skip: query.page ? (parseInt(query.page) - 1) * (parseInt(query.pageSize) || 50) : 0,
      take: query.pageSize ? parseInt(query.pageSize) : 50,
    });
  }

  @Get('employee/:employeeId')
  @RequirePermissions('HRMS_ATTENDANCE_READ')
  async getEmployeeAttendance(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.attendanceService.getEmployeeAttendance(
      employeeId,
      parseInt(month),
      parseInt(year),
    );
  }

  @Post('mark-absent')
  @RequirePermissions('HRMS_ATTENDANCE_UPDATE')
  async markAbsent(@Request() req, @Body() markAbsentDto: MarkAbsentDto) {
    return this.attendanceService.markAbsent(
      markAbsentDto.employeeId,
      new Date(markAbsentDto.date),
      markAbsentDto.notes,
    );
  }

  @Post('mark-leave')
  @RequirePermissions('HRMS_ATTENDANCE_UPDATE')
  async markLeave(@Request() req, @Body() markLeaveDto: MarkLeaveDto) {
    return this.attendanceService.markLeave(
      markLeaveDto.employeeId,
      new Date(markLeaveDto.date),
    );
  }

  @Put(':id')
  @RequirePermissions('HRMS_ATTENDANCE_UPDATE')
  async update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateAttendanceDto) {
    return this.attendanceService.updateAttendance(id, req.user.organizationId, updateDto);
  }

  @Get('summary')
  @RequirePermissions('HRMS_ATTENDANCE_READ')
  async getSummary(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.attendanceService.getAttendanceSummary(
      req.user.organizationId,
      parseInt(month),
      parseInt(year),
      departmentId,
    );
  }
}

@Controller('hrms/overtime-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OvertimeController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @RequirePermissions('HRMS_OVERTIME_CREATE')
  async create(@Request() req, @Body() createDto: CreateOvertimeRequestDto) {
    const employeeId = req.user.employeeId;
    return this.attendanceService.createOvertimeRequest(employeeId, createDto);
  }

  @Get()
  @RequirePermissions('HRMS_OVERTIME_CREATE')
  async findAll(@Request() req, @Query() query: any) {
    return this.attendanceService.findAllOvertimeRequests(req.user.organizationId, {
      employeeId: query.employeeId,
      status: query.status,
      skip: query.page ? (parseInt(query.page) - 1) * (parseInt(query.pageSize) || 50) : 0,
      take: query.pageSize ? parseInt(query.pageSize) : 50,
    });
  }

  @Put(':id/approve')
  @RequirePermissions('HRMS_OVERTIME_APPROVE')
  async approve(@Request() req, @Param('id') id: string, @Body() reviewDto: ReviewOvertimeDto) {
    return this.attendanceService.approveOvertimeRequest(
      id,
      req.user.organizationId,
      req.user.userId,
      reviewDto.notes,
    );
  }

  @Put(':id/reject')
  @RequirePermissions('HRMS_OVERTIME_APPROVE')
  async reject(@Request() req, @Param('id') id: string, @Body() reviewDto: ReviewOvertimeDto) {
    return this.attendanceService.rejectOvertimeRequest(
      id,
      req.user.organizationId,
      req.user.userId,
      reviewDto.notes,
    );
  }
}
