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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';
import { PayrollService } from '../services/payroll.service';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { PERMISSIONS } from '@iteck/shared';

class CreatePayrollDto {
  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsDateString()
  paymentDate: string;
}

class UpdatePayrollDto {
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

@ApiTags('hrms')
@ApiBearerAuth()
@Controller('hrms/payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_READ)
  @ApiOperation({ summary: 'Get all payroll runs' })
  @ApiResponse({ status: 200, description: 'Payroll runs retrieved' })
  async findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('branchId') branchId?: string,
  ) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payroll.controller.ts:findAll:entry',message:'GET /hrms/payroll called',data:{userId:user?.id,orgId:user?.organizationId,status,branchId},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    const result = await this.payrollService.findAll(user.organizationId, {
      status,
      branchId: branchId || user.branchId,
    });
    
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'payroll.controller.ts:findAll:exit',message:'Payroll runs returned',data:{count:result?.length,hasData:!!result},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    return result;
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_READ)
  @ApiOperation({ summary: 'Get payroll run details' })
  @ApiResponse({ status: 200, description: 'Payroll run retrieved' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.findOne(id, user.organizationId);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_CREATE)
  @ApiOperation({ summary: 'Create new payroll run' })
  @ApiResponse({ status: 201, description: 'Payroll run created' })
  async create(
    @Body() createDto: CreatePayrollDto,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.create(
      user.organizationId,
      user.branchId,
      user.id,
      {
        periodStart: new Date(createDto.periodStart),
        periodEnd: new Date(createDto.periodEnd),
        paymentDate: new Date(createDto.paymentDate),
      },
    );
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_UPDATE)
  @ApiOperation({ summary: 'Update payroll run' })
  @ApiResponse({ status: 200, description: 'Payroll run updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePayrollDto,
    @CurrentUser() user: any,
  ) {
    const data: any = {};
    if (updateDto.paymentDate) {
      data.paymentDate = new Date(updateDto.paymentDate);
    }
    if (updateDto.status) {
      data.status = updateDto.status;
    }

    return this.payrollService.update(id, user.organizationId, user.id, data);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_DELETE)
  @ApiOperation({ summary: 'Delete payroll run' })
  @ApiResponse({ status: 200, description: 'Payroll run deleted' })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.delete(id, user.organizationId);
  }

  @Post(':id/process')
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_UPDATE)
  @ApiOperation({ summary: 'Process payroll run (generate payslips)' })
  @ApiResponse({ status: 200, description: 'Payroll processed' })
  async process(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.processPayroll(id, user.organizationId, user.id);
  }

  @Post(':id/approve')
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_UPDATE)
  @ApiOperation({ summary: 'Approve payroll run' })
  @ApiResponse({ status: 200, description: 'Payroll approved' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.approvePayroll(id, user.organizationId, user.id);
  }

  @Post(':id/mark-paid')
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_UPDATE)
  @ApiOperation({ summary: 'Mark payroll run as paid' })
  @ApiResponse({ status: 200, description: 'Payroll marked as paid' })
  async markPaid(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.markAsPaid(id, user.organizationId, user.id);
  }

  @Get(':payrollRunId/payslip/:employeeId')
  @RequirePermissions(PERMISSIONS.HRMS_PAYROLL_READ)
  @ApiOperation({ summary: 'Get employee payslip' })
  @ApiResponse({ status: 200, description: 'Payslip retrieved' })
  async getPayslip(
    @Param('payrollRunId') payrollRunId: string,
    @Param('employeeId') employeeId: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.getPayslip(payrollRunId, employeeId, user.organizationId);
  }
}
