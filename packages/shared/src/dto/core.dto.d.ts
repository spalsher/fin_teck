export declare class CreateOrganizationDto {
    name: string;
    code: string;
    taxId?: string;
    address: any;
    currency: string;
    settings?: any;
}
export declare class UpdateOrganizationDto {
    name?: string;
    taxId?: string;
    address?: any;
    currency?: string;
    settings?: any;
}
export declare class CreateBranchDto {
    name: string;
    code: string;
    address: any;
    phone?: string;
    email?: string;
    isHeadOffice?: boolean;
}
export declare class UpdateBranchDto {
    name?: string;
    address?: any;
    phone?: string;
    email?: string;
    isActive?: boolean;
}
export declare class CreateServiceOfferingDto {
    code: string;
    name: string;
    serviceType: string;
    billingConfig: any;
}
export declare class UpdateServiceOfferingDto {
    name?: string;
    serviceType?: string;
    billingConfig?: any;
    isActive?: boolean;
}
