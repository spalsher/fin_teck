import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsEnum,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// ====================================
// Category Management DTOs
// ====================================

export class CreateCategoryApprovalStepDto {
  @IsNumber()
  @IsNotEmpty()
  sequenceNumber: number;

  @IsString()
  @IsNotEmpty()
  roleCode: string;

  @IsEnum(['INFO', 'APPROVAL', 'CONDITIONAL'])
  @IsNotEmpty()
  approvalType: 'INFO' | 'APPROVAL' | 'CONDITIONAL';

  @IsNumber()
  @IsOptional()
  @Min(0)
  minAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxAmount?: number;

  @IsBoolean()
  @IsOptional()
  isMandatory?: boolean;
}

export class CreateRequisitionCategoryDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['ADMIN', 'FINANCE', 'PROCUREMENT'])
  @IsNotEmpty()
  executionDept: 'ADMIN' | 'FINANCE' | 'PROCUREMENT';

  @IsBoolean()
  @IsOptional()
  requiresQuotation?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryApprovalStepDto)
  approvalSteps: CreateCategoryApprovalStepDto[];
}

export class UpdateRequisitionCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['ADMIN', 'FINANCE', 'PROCUREMENT'])
  @IsOptional()
  executionDept?: 'ADMIN' | 'FINANCE' | 'PROCUREMENT';

  @IsBoolean()
  @IsOptional()
  requiresQuotation?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCategoryApprovalStepDto)
  @IsOptional()
  approvalSteps?: CreateCategoryApprovalStepDto[];
}

// ====================================
// Requisition DTOs
// ====================================

export class CreateRequisitionDto {
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

export class UpdateRequisitionDto {
  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  attachments?: string[];
}

export class RequisitionActionDto {
  @IsEnum(['APPROVE', 'REJECT', 'SEND_INFO'])
  @IsNotEmpty()
  action: 'APPROVE' | 'REJECT' | 'SEND_INFO';

  @IsString()
  @IsOptional()
  comments?: string;
}

export class ExecuteRequisitionDto {
  @IsString()
  @IsOptional()
  executionNotes?: string;
}

// ====================================
// Quotation DTOs
// ====================================

export class CreateQuotationDto {
  @IsString()
  @IsNotEmpty()
  vendorName: string;

  @IsString()
  @IsOptional()
  vendorContact?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsNotEmpty()
  quotationDate: string;

  @IsDateString()
  @IsOptional()
  validityDate?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateQuotationDto {
  @IsString()
  @IsOptional()
  vendorName?: string;

  @IsString()
  @IsOptional()
  vendorContact?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsOptional()
  quotationDate?: string;

  @IsDateString()
  @IsOptional()
  validityDate?: string;

  @IsString()
  @IsOptional()
  filePath?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isSelected?: boolean;
}

// ====================================
// Query DTOs
// ====================================

export class RequisitionQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  pageSize?: number;
}

// ====================================
// Express-style requisition (create with items, flat approval flow)
// ====================================

export class RequisitionItemDto {
  @IsString()
  @IsOptional()
  itemDesc?: string;

  @IsString()
  @IsOptional()
  item_desc?: string;

  @IsString()
  @IsOptional()
  itemSize?: string;

  @IsString()
  @IsOptional()
  item_size?: string;

  @IsString()
  @IsOptional()
  itemBrand?: string;

  @IsString()
  @IsOptional()
  item_brand?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  itemQty?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  item_qty?: number;

  @IsString()
  @IsOptional()
  itemEstCost?: string;

  @IsString()
  @IsOptional()
  item_est_cost?: string;

  @IsString()
  @IsOptional()
  itemRemarks?: string;

  @IsString()
  @IsOptional()
  item_remarks?: string;
}

export class CreateRequisitionWithItemsDto {
  @IsNotEmpty()
  employeeId: string; // Employee id (UUID) - creator

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  business?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequisitionItemDto)
  items: RequisitionItemDto[];
}

export class ApproveHodDto {
  @IsNotEmpty()
  requisitionId: string;

  @IsNotEmpty()
  approvedByEmployeeId: string;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}

export class ApproveCommitteeDto {
  @IsNotEmpty()
  requisitionId: string;

  @IsNotEmpty()
  approvedByEmployeeId: string;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}

export class ApproveCeoDto {
  @IsNotEmpty()
  requisitionId: string;

  @IsNotEmpty()
  approvedByEmployeeId: string;

  @IsBoolean()
  @IsOptional()
  approved?: boolean;
}

export class AcknowledgeProcurementDto {
  @IsNotEmpty()
  requisitionId: string;

  @IsNotEmpty()
  acknowledgedByEmployeeId: string;
}

export class UpdateQuotationsDto {
  @IsString()
  @IsOptional()
  quotation1Url?: string;

  @IsString()
  @IsOptional()
  quotation2Url?: string;

  @IsString()
  @IsOptional()
  quotation3Url?: string;

  @IsNotEmpty()
  updatedByEmployeeId: string;
}

export class ExpectedHandoverDto {
  @IsString()
  @IsOptional()
  expectedHandoverDate?: string;

  @IsNotEmpty()
  updatedByEmployeeId: string;
}

export class HandoverFinanceDto {
  @IsNotEmpty()
  requisitionId: string;

  @IsNotEmpty()
  handedByEmployeeId: string;
}

export class ApproveFinanceDto {
  @IsNotEmpty()
  requisitionId: string;

  @IsNotEmpty()
  approvedByEmployeeId: string;

  @IsNumber()
  @Min(1)
  @Max(3)
  approvedQuotationIndex: number; // 1, 2, or 3
}
