"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceOfferingSchema = exports.createServiceOfferingSchema = exports.updateBranchSchema = exports.createBranchSchema = exports.updateOrganizationSchema = exports.createOrganizationSchema = void 0;
const zod_1 = require("zod");
const common_schema_1 = require("./common.schema");
exports.createOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Organization name is required'),
    code: zod_1.z
        .string()
        .min(2, 'Code must be at least 2 characters')
        .max(10, 'Code must not exceed 10 characters')
        .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
    taxId: zod_1.z.string().optional(),
    address: common_schema_1.addressSchema,
    currency: zod_1.z.string().length(3, 'Currency must be 3 characters (ISO 4217)'),
    settings: zod_1.z.any().optional(),
});
exports.updateOrganizationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    taxId: zod_1.z.string().optional(),
    address: common_schema_1.addressSchema.optional(),
    currency: zod_1.z.string().length(3).optional(),
    settings: zod_1.z.any().optional(),
});
exports.createBranchSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Branch name is required'),
    code: zod_1.z
        .string()
        .min(2, 'Code must be at least 2 characters')
        .max(10, 'Code must not exceed 10 characters')
        .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
    address: common_schema_1.addressSchema,
    phone: zod_1.z.string().optional(),
    email: common_schema_1.emailSchema.optional(),
    isHeadOffice: zod_1.z.boolean().optional().default(false),
});
exports.updateBranchSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    address: common_schema_1.addressSchema.optional(),
    phone: zod_1.z.string().optional(),
    email: common_schema_1.emailSchema.optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.createServiceOfferingSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Code is required'),
    name: zod_1.z.string().min(1, 'Name is required'),
    serviceType: zod_1.z.string().min(1, 'Service type is required'),
    billingConfig: zod_1.z.any(),
});
exports.updateServiceOfferingSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    serviceType: zod_1.z.string().optional(),
    billingConfig: zod_1.z.any().optional(),
    isActive: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=core.schema.js.map