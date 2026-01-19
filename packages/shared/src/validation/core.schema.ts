import { z } from 'zod';
import { addressSchema, emailSchema, uuidSchema } from './common.schema';

export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code must not exceed 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  taxId: z.string().optional(),
  address: addressSchema,
  currency: z.string().length(3, 'Currency must be 3 characters (ISO 4217)'),
  settings: z.any().optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).optional(),
  taxId: z.string().optional(),
  address: addressSchema.optional(),
  currency: z.string().length(3).optional(),
  settings: z.any().optional(),
});

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required'),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code must not exceed 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  address: addressSchema,
  phone: z.string().optional(),
  email: emailSchema.optional(),
  isHeadOffice: z.boolean().optional().default(false),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1).optional(),
  address: addressSchema.optional(),
  phone: z.string().optional(),
  email: emailSchema.optional(),
  isActive: z.boolean().optional(),
});

export const createServiceOfferingSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  serviceType: z.string().min(1, 'Service type is required'),
  billingConfig: z.any(),
});

export const updateServiceOfferingSchema = z.object({
  name: z.string().min(1).optional(),
  serviceType: z.string().optional(),
  billingConfig: z.any().optional(),
  isActive: z.boolean().optional(),
});
