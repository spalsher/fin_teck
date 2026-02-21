export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    branchId?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    branchId?: string;
    roleIds: string[];
}
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    branchId?: string;
    isActive?: boolean;
    roleIds?: string[];
}
