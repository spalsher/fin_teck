export interface RequisitionCategory {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description?: string;
  executionDept: 'ADMIN' | 'FINANCE' | 'PROCUREMENT';
  requiresQuotation: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  approvalSteps?: CategoryApprovalStep[];
}

export interface CategoryApprovalStep {
  id: string;
  categoryId: string;
  sequenceNumber: number;
  roleCode: string;
  approvalType: 'INFO' | 'APPROVAL' | 'CONDITIONAL';
  minAmount?: number;
  maxAmount?: number;
  isMandatory: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Requisition {
  id: string;
  organizationId: string;
  branchId: string;
  categoryId: string;
  departmentId: string;
  requisitionNo: string;
  amount?: number;
  description: string;
  status: 'INITIATED' | 'IN_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'CANCELLED';
  currentStep: number;
  requiresQuotation: boolean;
  executionDept: string;
  executedBy?: string;
  executedAt?: Date;
  executionNotes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  category?: RequisitionCategory;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  approvalLogs?: RequisitionApprovalLog[];
  quotations?: Quotation[];
}

export interface RequisitionApprovalLog {
  id: string;
  requisitionId: string;
  stepNumber: number;
  roleCode: string;
  action: 'APPROVED' | 'REJECTED' | 'INFO_SENT';
  comments?: string;
  approvedBy: string;
  approvedAt: Date;
  metadata?: Record<string, any>;
  approver?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Quotation {
  id: string;
  requisitionId: string;
  vendorName: string;
  vendorContact?: string;
  amount: number;
  currency: string;
  quotationDate: Date;
  validityDate?: Date;
  filePath?: string;
  notes?: string;
  isSelected: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface RequisitionWorkflowStep {
  stepNumber: number;
  roleCode: string;
  approvalType: 'INFO' | 'APPROVAL' | 'CONDITIONAL';
  minAmount?: number;
  maxAmount?: number;
  isMandatory: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INFO_SENT' | 'SKIPPED';
  approvedBy?: string;
  approvedAt?: Date;
  comments?: string;
}

export interface RequisitionWorkflow {
  categoryId: string;
  categoryName: string;
  steps: RequisitionWorkflowStep[];
  currentStep: number;
  status: string;
}
