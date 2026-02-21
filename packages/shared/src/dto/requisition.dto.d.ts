export declare class CreateCategoryApprovalStepDto {
    sequenceNumber: number;
    roleCode: string;
    approvalType: 'INFO' | 'APPROVAL' | 'CONDITIONAL';
    minAmount?: number;
    maxAmount?: number;
    isMandatory?: boolean;
}
export declare class CreateRequisitionCategoryDto {
    code: string;
    name: string;
    description?: string;
    executionDept: 'ADMIN' | 'FINANCE' | 'PROCUREMENT';
    requiresQuotation?: boolean;
    approvalSteps: CreateCategoryApprovalStepDto[];
}
export declare class UpdateRequisitionCategoryDto {
    name?: string;
    description?: string;
    executionDept?: 'ADMIN' | 'FINANCE' | 'PROCUREMENT';
    requiresQuotation?: boolean;
    isActive?: boolean;
    approvalSteps?: CreateCategoryApprovalStepDto[];
}
export declare class CreateRequisitionDto {
    branchId: string;
    categoryId: string;
    departmentId: string;
    amount?: number;
    description: string;
    attachments?: string[];
}
export declare class UpdateRequisitionDto {
    amount?: number;
    description?: string;
    attachments?: string[];
}
export declare class RequisitionActionDto {
    action: 'APPROVE' | 'REJECT' | 'SEND_INFO';
    comments?: string;
}
export declare class ExecuteRequisitionDto {
    executionNotes?: string;
}
export declare class CreateQuotationDto {
    vendorName: string;
    vendorContact?: string;
    amount: number;
    currency?: string;
    quotationDate: string;
    validityDate?: string;
    filePath?: string;
    notes?: string;
}
export declare class UpdateQuotationDto {
    vendorName?: string;
    vendorContact?: string;
    amount?: number;
    currency?: string;
    quotationDate?: string;
    validityDate?: string;
    filePath?: string;
    notes?: string;
    isSelected?: boolean;
}
export declare class RequisitionQueryDto {
    status?: string;
    categoryId?: string;
    departmentId?: string;
    branchId?: string;
    search?: string;
    page?: number;
    pageSize?: number;
}
export declare class RequisitionItemDto {
    itemDesc?: string;
    item_desc?: string;
    itemSize?: string;
    item_size?: string;
    itemBrand?: string;
    item_brand?: string;
    itemQty?: number;
    item_qty?: number;
    itemEstCost?: string;
    item_est_cost?: string;
    itemRemarks?: string;
    item_remarks?: string;
}
export declare class CreateRequisitionWithItemsDto {
    employeeId: string;
    location?: string;
    material?: string;
    priority?: string;
    business?: string;
    items: RequisitionItemDto[];
}
export declare class ApproveHodDto {
    requisitionId: string;
    approvedByEmployeeId: string;
    approved?: boolean;
}
export declare class ApproveCommitteeDto {
    requisitionId: string;
    approvedByEmployeeId: string;
    approved?: boolean;
}
export declare class ApproveCeoDto {
    requisitionId: string;
    approvedByEmployeeId: string;
    approved?: boolean;
}
export declare class AcknowledgeProcurementDto {
    requisitionId: string;
    acknowledgedByEmployeeId: string;
}
export declare class UpdateQuotationsDto {
    quotation1Url?: string;
    quotation2Url?: string;
    quotation3Url?: string;
    updatedByEmployeeId: string;
}
export declare class ExpectedHandoverDto {
    expectedHandoverDate?: string;
    updatedByEmployeeId: string;
}
export declare class HandoverFinanceDto {
    requisitionId: string;
    handedByEmployeeId: string;
}
export declare class ApproveFinanceDto {
    requisitionId: string;
    approvedByEmployeeId: string;
    approvedQuotationIndex: number;
}
