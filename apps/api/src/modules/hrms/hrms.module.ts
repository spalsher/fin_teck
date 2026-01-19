import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../core/core.module';

// Services
import { EmployeeService } from './services/employee.service';
import { PayrollService } from './services/payroll.service';
import { DepartmentService } from './services/department.service';
import { DesignationService } from './services/designation.service';
import { LeaveService } from './services/leave.service';
import { AttendanceService } from './services/attendance.service';
import { EmployeeDocumentService } from './services/employee-document.service';
import { SalaryStructureService } from './services/salary-structure.service';

// Controllers
import { EmployeeController } from './controllers/employee.controller';
import { PayrollController } from './controllers/payroll.controller';
import { DepartmentController } from './controllers/department.controller';
import { DesignationController } from './controllers/designation.controller';
import { LeaveTypeController, LeaveBalanceController, LeaveRequestController } from './controllers/leave.controller';
import { ShiftController, ShiftAssignmentController, AttendanceController, OvertimeController } from './controllers/attendance.controller';
import { EmployeeDocumentController } from './controllers/employee-document.controller';

@Module({
  imports: [SharedModule, CoreModule],
  controllers: [
    EmployeeController,
    PayrollController,
    DepartmentController,
    DesignationController,
    LeaveTypeController,
    LeaveBalanceController,
    LeaveRequestController,
    ShiftController,
    ShiftAssignmentController,
    AttendanceController,
    OvertimeController,
    EmployeeDocumentController,
  ],
  providers: [
    EmployeeService,
    PayrollService,
    DepartmentService,
    DesignationService,
    LeaveService,
    AttendanceService,
    EmployeeDocumentService,
    SalaryStructureService,
  ],
  exports: [
    EmployeeService,
    PayrollService,
    DepartmentService,
    DesignationService,
    LeaveService,
    AttendanceService,
    EmployeeDocumentService,
    SalaryStructureService,
  ],
})
export class HrmsModule {}
