import { BaseEntity } from './common.types';
export interface User extends BaseEntity {
    organizationId: string;
    branchId: string | null;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    lastLogin: Date | null;
    preferences: Record<string, any>;
}
export interface Role extends BaseEntity {
    name: string;
    code: string;
    description: string | null;
    isSystem: boolean;
}
export interface Permission extends BaseEntity {
    module: string;
    entity: string;
    action: PermissionAction;
    code: string;
    description: string | null;
}
export declare enum PermissionAction {
    CREATE = "create",
    READ = "read",
    UPDATE = "update",
    DELETE = "delete",
    APPROVE = "approve",
    POST = "post",
    CANCEL = "cancel"
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface JwtPayload {
    sub: string;
    email: string;
    organizationId: string;
    branchId: string | null;
    permissions: string[];
    iat?: number;
    exp?: number;
}
export interface RefreshToken extends BaseEntity {
    userId: string;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    deviceInfo: string | null;
}
export interface AuditLog extends BaseEntity {
    userId: string;
    action: string;
    entity: string;
    entityId: string | null;
    changes: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
    correlationId: string;
}
