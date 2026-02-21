"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const common_schema_1 = require("./common.schema");
const passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number');
exports.loginSchema = zod_1.z.object({
    email: common_schema_1.emailSchema,
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.registerSchema = zod_1.z.object({
    email: common_schema_1.emailSchema,
    password: passwordSchema,
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    organizationId: common_schema_1.uuidSchema,
    branchId: common_schema_1.uuidSchema.optional(),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string().min(1, 'Old password is required'),
    newPassword: passwordSchema,
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: common_schema_1.emailSchema,
});
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Reset token is required'),
    newPassword: passwordSchema,
});
exports.createUserSchema = zod_1.z.object({
    email: common_schema_1.emailSchema,
    firstName: zod_1.z.string().min(1, 'First name is required'),
    lastName: zod_1.z.string().min(1, 'Last name is required'),
    branchId: common_schema_1.uuidSchema.optional(),
    roleIds: zod_1.z.array(common_schema_1.uuidSchema).min(1, 'At least one role is required'),
});
exports.updateUserSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1).optional(),
    lastName: zod_1.z.string().min(1).optional(),
    branchId: common_schema_1.uuidSchema.optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
    roleIds: zod_1.z.array(common_schema_1.uuidSchema).optional(),
});
//# sourceMappingURL=auth.schema.js.map