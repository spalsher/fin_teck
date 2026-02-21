"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = exports.phoneSchema = exports.emailSchema = exports.uuidSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc'),
});
exports.uuidSchema = zod_1.z.string().uuid();
exports.emailSchema = zod_1.z.string().email();
exports.phoneSchema = zod_1.z.string().regex(/^\+?[1-9]\d{1,14}$/);
exports.addressSchema = zod_1.z.object({
    line1: zod_1.z.string().min(1),
    line2: zod_1.z.string().optional(),
    city: zod_1.z.string().min(1),
    state: zod_1.z.string().optional(),
    postalCode: zod_1.z.string().optional(),
    country: zod_1.z.string().min(1),
});
//# sourceMappingURL=common.schema.js.map