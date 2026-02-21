"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveFinanceDto = exports.HandoverFinanceDto = exports.ExpectedHandoverDto = exports.UpdateQuotationsDto = exports.AcknowledgeProcurementDto = exports.ApproveCeoDto = exports.ApproveCommitteeDto = exports.ApproveHodDto = exports.CreateRequisitionWithItemsDto = exports.RequisitionItemDto = exports.RequisitionQueryDto = exports.UpdateQuotationDto = exports.CreateQuotationDto = exports.ExecuteRequisitionDto = exports.RequisitionActionDto = exports.UpdateRequisitionDto = exports.CreateRequisitionDto = exports.UpdateRequisitionCategoryDto = exports.CreateRequisitionCategoryDto = exports.CreateCategoryApprovalStepDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCategoryApprovalStepDto {
}
exports.CreateCategoryApprovalStepDto = CreateCategoryApprovalStepDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateCategoryApprovalStepDto.prototype, "sequenceNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCategoryApprovalStepDto.prototype, "roleCode", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['INFO', 'APPROVAL', 'CONDITIONAL']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCategoryApprovalStepDto.prototype, "approvalType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCategoryApprovalStepDto.prototype, "minAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCategoryApprovalStepDto.prototype, "maxAmount", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateCategoryApprovalStepDto.prototype, "isMandatory", void 0);
class CreateRequisitionCategoryDto {
}
exports.CreateRequisitionCategoryDto = CreateRequisitionCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionCategoryDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRequisitionCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ADMIN', 'FINANCE', 'PROCUREMENT']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionCategoryDto.prototype, "executionDept", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateRequisitionCategoryDto.prototype, "requiresQuotation", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateCategoryApprovalStepDto),
    __metadata("design:type", Array)
], CreateRequisitionCategoryDto.prototype, "approvalSteps", void 0);
class UpdateRequisitionCategoryDto {
}
exports.UpdateRequisitionCategoryDto = UpdateRequisitionCategoryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRequisitionCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRequisitionCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['ADMIN', 'FINANCE', 'PROCUREMENT']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRequisitionCategoryDto.prototype, "executionDept", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateRequisitionCategoryDto.prototype, "requiresQuotation", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateRequisitionCategoryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateCategoryApprovalStepDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateRequisitionCategoryDto.prototype, "approvalSteps", void 0);
class CreateRequisitionDto {
}
exports.CreateRequisitionDto = CreateRequisitionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRequisitionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateRequisitionDto.prototype, "attachments", void 0);
class UpdateRequisitionDto {
}
exports.UpdateRequisitionDto = UpdateRequisitionDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateRequisitionDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRequisitionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateRequisitionDto.prototype, "attachments", void 0);
class RequisitionActionDto {
}
exports.RequisitionActionDto = RequisitionActionDto;
__decorate([
    (0, class_validator_1.IsEnum)(['APPROVE', 'REJECT', 'SEND_INFO']),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RequisitionActionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionActionDto.prototype, "comments", void 0);
class ExecuteRequisitionDto {
}
exports.ExecuteRequisitionDto = ExecuteRequisitionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExecuteRequisitionDto.prototype, "executionNotes", void 0);
class CreateQuotationDto {
}
exports.CreateQuotationDto = CreateQuotationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "vendorName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "vendorContact", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateQuotationDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "quotationDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "validityDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "filePath", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateQuotationDto.prototype, "notes", void 0);
class UpdateQuotationDto {
}
exports.UpdateQuotationDto = UpdateQuotationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationDto.prototype, "vendorName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationDto.prototype, "vendorContact", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateQuotationDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationDto.prototype, "quotationDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationDto.prototype, "validityDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationDto.prototype, "filePath", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateQuotationDto.prototype, "isSelected", void 0);
class RequisitionQueryDto {
}
exports.RequisitionQueryDto = RequisitionQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionQueryDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionQueryDto.prototype, "departmentId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionQueryDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RequisitionQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], RequisitionQueryDto.prototype, "pageSize", void 0);
class RequisitionItemDto {
}
exports.RequisitionItemDto = RequisitionItemDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "itemDesc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "item_desc", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "itemSize", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "item_size", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "itemBrand", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "item_brand", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RequisitionItemDto.prototype, "itemQty", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RequisitionItemDto.prototype, "item_qty", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "itemEstCost", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "item_est_cost", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "itemRemarks", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RequisitionItemDto.prototype, "item_remarks", void 0);
class CreateRequisitionWithItemsDto {
}
exports.CreateRequisitionWithItemsDto = CreateRequisitionWithItemsDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRequisitionWithItemsDto.prototype, "employeeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRequisitionWithItemsDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRequisitionWithItemsDto.prototype, "material", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRequisitionWithItemsDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRequisitionWithItemsDto.prototype, "business", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RequisitionItemDto),
    __metadata("design:type", Array)
], CreateRequisitionWithItemsDto.prototype, "items", void 0);
class ApproveHodDto {
}
exports.ApproveHodDto = ApproveHodDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveHodDto.prototype, "requisitionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveHodDto.prototype, "approvedByEmployeeId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ApproveHodDto.prototype, "approved", void 0);
class ApproveCommitteeDto {
}
exports.ApproveCommitteeDto = ApproveCommitteeDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveCommitteeDto.prototype, "requisitionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveCommitteeDto.prototype, "approvedByEmployeeId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ApproveCommitteeDto.prototype, "approved", void 0);
class ApproveCeoDto {
}
exports.ApproveCeoDto = ApproveCeoDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveCeoDto.prototype, "requisitionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveCeoDto.prototype, "approvedByEmployeeId", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ApproveCeoDto.prototype, "approved", void 0);
class AcknowledgeProcurementDto {
}
exports.AcknowledgeProcurementDto = AcknowledgeProcurementDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AcknowledgeProcurementDto.prototype, "requisitionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AcknowledgeProcurementDto.prototype, "acknowledgedByEmployeeId", void 0);
class UpdateQuotationsDto {
}
exports.UpdateQuotationsDto = UpdateQuotationsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationsDto.prototype, "quotation1Url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationsDto.prototype, "quotation2Url", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateQuotationsDto.prototype, "quotation3Url", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateQuotationsDto.prototype, "updatedByEmployeeId", void 0);
class ExpectedHandoverDto {
}
exports.ExpectedHandoverDto = ExpectedHandoverDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ExpectedHandoverDto.prototype, "expectedHandoverDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ExpectedHandoverDto.prototype, "updatedByEmployeeId", void 0);
class HandoverFinanceDto {
}
exports.HandoverFinanceDto = HandoverFinanceDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], HandoverFinanceDto.prototype, "requisitionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], HandoverFinanceDto.prototype, "handedByEmployeeId", void 0);
class ApproveFinanceDto {
}
exports.ApproveFinanceDto = ApproveFinanceDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveFinanceDto.prototype, "requisitionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ApproveFinanceDto.prototype, "approvedByEmployeeId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(3),
    __metadata("design:type", Number)
], ApproveFinanceDto.prototype, "approvedQuotationIndex", void 0);
//# sourceMappingURL=requisition.dto.js.map