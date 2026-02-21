import { z } from 'zod';
export declare const createOrganizationSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    taxId: z.ZodOptional<z.ZodString>;
    address: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }>;
    currency: z.ZodString;
    settings: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    currency: string;
    address: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    };
    taxId?: string | undefined;
    settings?: any;
}, {
    code: string;
    name: string;
    currency: string;
    address: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    };
    taxId?: string | undefined;
    settings?: any;
}>;
export declare const updateOrganizationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }>>;
    currency: z.ZodOptional<z.ZodString>;
    settings: z.ZodOptional<z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    currency?: string | undefined;
    taxId?: string | undefined;
    address?: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    settings?: any;
}, {
    name?: string | undefined;
    currency?: string | undefined;
    taxId?: string | undefined;
    address?: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    settings?: any;
}>;
export declare const createBranchSchema: z.ZodObject<{
    name: z.ZodString;
    code: z.ZodString;
    address: z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    isHeadOffice: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    address: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    };
    isHeadOffice: boolean;
    email?: string | undefined;
    phone?: string | undefined;
}, {
    code: string;
    name: string;
    address: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    };
    email?: string | undefined;
    phone?: string | undefined;
    isHeadOffice?: boolean | undefined;
}>;
export declare const updateBranchSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodOptional<z.ZodString>;
        postalCode: z.ZodOptional<z.ZodString>;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }, {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    }>>;
    phone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    isActive?: boolean | undefined;
    name?: string | undefined;
    address?: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    phone?: string | undefined;
}, {
    email?: string | undefined;
    isActive?: boolean | undefined;
    name?: string | undefined;
    address?: {
        line1: string;
        city: string;
        country: string;
        line2?: string | undefined;
        state?: string | undefined;
        postalCode?: string | undefined;
    } | undefined;
    phone?: string | undefined;
}>;
export declare const createServiceOfferingSchema: z.ZodObject<{
    code: z.ZodString;
    name: z.ZodString;
    serviceType: z.ZodString;
    billingConfig: z.ZodAny;
}, "strip", z.ZodTypeAny, {
    code: string;
    name: string;
    serviceType: string;
    billingConfig?: any;
}, {
    code: string;
    name: string;
    serviceType: string;
    billingConfig?: any;
}>;
export declare const updateServiceOfferingSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    serviceType: z.ZodOptional<z.ZodString>;
    billingConfig: z.ZodOptional<z.ZodAny>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    serviceType?: string | undefined;
    billingConfig?: any;
}, {
    isActive?: boolean | undefined;
    name?: string | undefined;
    serviceType?: string | undefined;
    billingConfig?: any;
}>;
