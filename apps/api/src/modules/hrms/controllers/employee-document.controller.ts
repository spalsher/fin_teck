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
import { EmployeeDocumentService } from '../services/employee-document.service';
import { IsString, IsOptional, IsDateString } from 'class-validator';

class CreateEmployeeDocumentDto {
  @IsString()
  documentType: string; // ID, PASSPORT, VISA, CONTRACT, CERTIFICATE, etc.

  @IsOptional()
  @IsString()
  documentNo?: string;

  @IsString()
  title: string;

  @IsString()
  filePath: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpdateEmployeeDocumentDto {
  @IsOptional()
  @IsString()
  documentType?: string;

  @IsOptional()
  @IsString()
  documentNo?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  filePath?: string;

  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  issuedBy?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

@Controller('hrms/employee-documents')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeDocumentController {
  constructor(private readonly employeeDocumentService: EmployeeDocumentService) {}

  @Post('employee/:employeeId')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_CREATE')
  async create(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Body() createDto: CreateEmployeeDocumentDto,
  ) {
    return this.employeeDocumentService.create(
      employeeId,
      req.user.organizationId,
      createDto,
    );
  }

  @Get('employee/:employeeId')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_READ')
  async findAllByEmployee(
    @Request() req,
    @Param('employeeId') employeeId: string,
    @Query('documentType') documentType?: string,
  ) {
    return this.employeeDocumentService.findAllByEmployee(
      employeeId,
      req.user.organizationId,
      { documentType },
    );
  }

  @Get('expiring')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_READ')
  async getExpiringDocuments(@Request() req, @Query('days') days?: string) {
    return this.employeeDocumentService.getExpiringDocuments(
      req.user.organizationId,
      days ? parseInt(days) : 30,
    );
  }

  @Get('expired')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_READ')
  async getExpiredDocuments(@Request() req) {
    return this.employeeDocumentService.getExpiredDocuments(req.user.organizationId);
  }

  @Get('by-type/:documentType')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_READ')
  async getDocumentsByType(@Request() req, @Param('documentType') documentType: string) {
    return this.employeeDocumentService.getDocumentsByType(
      req.user.organizationId,
      documentType,
    );
  }

  @Get(':id')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_READ')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.employeeDocumentService.findOne(id, req.user.organizationId);
  }

  @Put(':id')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_CREATE')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmployeeDocumentDto,
  ) {
    return this.employeeDocumentService.update(id, req.user.organizationId, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('HRMS_EMPLOYEE_DOCUMENT_DELETE')
  async delete(@Request() req, @Param('id') id: string) {
    return this.employeeDocumentService.delete(id, req.user.organizationId);
  }
}
