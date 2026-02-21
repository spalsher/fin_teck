import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const uuidSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const phoneSchema: z.ZodString;
export declare const addressSchema: z.ZodObject<{
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
