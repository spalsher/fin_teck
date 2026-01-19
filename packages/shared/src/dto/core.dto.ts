export class CreateOrganizationDto {
  name: string;
  code: string;
  taxId?: string;
  address: any;
  currency: string;
  settings?: any;
}

export class UpdateOrganizationDto {
  name?: string;
  taxId?: string;
  address?: any;
  currency?: string;
  settings?: any;
}

export class CreateBranchDto {
  name: string;
  code: string;
  address: any;
  phone?: string;
  email?: string;
  isHeadOffice?: boolean;
}

export class UpdateBranchDto {
  name?: string;
  address?: any;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

export class CreateServiceOfferingDto {
  code: string;
  name: string;
  serviceType: string;
  billingConfig: any;
}

export class UpdateServiceOfferingDto {
  name?: string;
  serviceType?: string;
  billingConfig?: any;
  isActive?: boolean;
}
