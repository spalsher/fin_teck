import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (development only)
  console.log('🗑️  Cleaning existing data...');
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.rolePermission.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
    prisma.permission.deleteMany(),
    prisma.documentSequence.deleteMany(),
    prisma.serviceOffering.deleteMany(),
    prisma.branch.deleteMany(),
    prisma.organization.deleteMany(),
  ]);

  // 1. Create Organization
  console.log('🏢 Creating organization...');
  const organization = await prisma.organization.create({
    data: {
      name: 'iTecknologi Tracking Services (Pvt) Ltd',
      code: 'ITECK',
      taxId: 'NTN-1234567',
      currency: 'PKR',
      address: {
        line1: 'IT Tower, Plot 5-C',
        city: 'Karachi',
        state: 'Sindh',
        postalCode: '75500',
        country: 'Pakistan',
      },
      settings: {
        fiscalYearStart: '01-07', // July 1
        defaultLanguage: 'en',
        timezone: 'Asia/Karachi',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: {
          decimalSeparator: '.',
          thousandsSeparator: ',',
          decimals: 2,
        },
      },
    },
  });

  // 2. Create Branches
  console.log('🏪 Creating branches...');
  const headOfficeBranch = await prisma.branch.create({
    data: {
      organizationId: organization.id,
      name: 'Head Office',
      code: 'HO',
      isHeadOffice: true,
      isActive: true,
      address: {
        line1: 'IT Tower, Plot 5-C',
        city: 'Karachi',
        state: 'Sindh',
        postalCode: '75500',
        country: 'Pakistan',
      },
      phone: '+92-21-35301234',
      email: 'headoffice@iteck.pk',
    },
  });

  const lahoreBranch = await prisma.branch.create({
    data: {
      organizationId: organization.id,
      name: 'Lahore Branch',
      code: 'LHR',
      isHeadOffice: false,
      isActive: true,
      address: {
        line1: 'Commercial Plaza, MM Alam Road',
        city: 'Lahore',
        state: 'Punjab',
        postalCode: '54000',
        country: 'Pakistan',
      },
      phone: '+92-42-35301234',
      email: 'lahore@iteck.pk',
    },
  });

  // 3. Create Service Offerings
  console.log('🎯 Creating service offerings...');
  await prisma.serviceOffering.createMany({
    data: [
      {
        organizationId: organization.id,
        code: 'ASSET_TRACK',
        name: 'Asset Tracking Service',
        serviceType: 'ASSET_TRACKING',
        billingConfig: {
          defaultRate: 500,
          billingCycle: 'MONTHLY',
          usageBased: true,
          unitOfMeasure: 'device-days',
        },
      },
      {
        organizationId: organization.id,
        code: 'FLEET_MGT',
        name: 'Fleet Management Solution',
        serviceType: 'FLEET_MANAGEMENT',
        billingConfig: {
          defaultRate: 1500,
          billingCycle: 'MONTHLY',
          usageBased: false,
          unitOfMeasure: 'vehicle',
        },
      },
      {
        organizationId: organization.id,
        code: 'DEVICE_SALES',
        name: 'GPS Device Sales',
        serviceType: 'DEVICE_SALES',
        billingConfig: {
          defaultRate: 15000,
          billingCycle: 'ONE_TIME',
          usageBased: false,
        },
      },
      {
        organizationId: organization.id,
        code: 'INSTALLATION',
        name: 'Installation Service',
        serviceType: 'INSTALLATION',
        billingConfig: {
          defaultRate: 3000,
          billingCycle: 'ONE_TIME',
          usageBased: false,
        },
      },
      {
        organizationId: organization.id,
        code: 'MAINTENANCE',
        name: 'Maintenance Service',
        serviceType: 'MAINTENANCE',
        billingConfig: {
          defaultRate: 2000,
          billingCycle: 'ONE_TIME',
          usageBased: false,
        },
      },
    ],
  });

  // 4. Create Permissions
  console.log('🔐 Creating permissions...');
  const permissionsData = [
    // Core
    { module: 'core', entity: 'organization', action: 'read', code: 'core:organization:read', description: 'View organization details' },
    { module: 'core', entity: 'organization', action: 'update', code: 'core:organization:update', description: 'Update organization details' },
    { module: 'core', entity: 'branch', action: 'create', code: 'core:branch:create', description: 'Create branches' },
    { module: 'core', entity: 'branch', action: 'read', code: 'core:branch:read', description: 'View branches' },
    { module: 'core', entity: 'branch', action: 'update', code: 'core:branch:update', description: 'Update branches' },
    { module: 'core', entity: 'branch', action: 'delete', code: 'core:branch:delete', description: 'Delete branches' },
    
    // Auth & Users
    { module: 'auth', entity: 'user', action: 'create', code: 'auth:user:create', description: 'Create users' },
    { module: 'auth', entity: 'user', action: 'read', code: 'auth:user:read', description: 'View users' },
    { module: 'auth', entity: 'user', action: 'update', code: 'auth:user:update', description: 'Update users' },
    { module: 'auth', entity: 'user', action: 'delete', code: 'auth:user:delete', description: 'Delete users' },
    { module: 'auth', entity: 'role', action: 'create', code: 'auth:role:create', description: 'Create roles' },
    { module: 'auth', entity: 'role', action: 'read', code: 'auth:role:read', description: 'View roles' },
    { module: 'auth', entity: 'role', action: 'update', code: 'auth:role:update', description: 'Update roles' },
    { module: 'auth', entity: 'role', action: 'delete', code: 'auth:role:delete', description: 'Delete roles' },
    
    // Finance
    { module: 'finance', entity: 'customer', action: 'create', code: 'finance:customer:create', description: 'Create customers' },
    { module: 'finance', entity: 'customer', action: 'read', code: 'finance:customer:read', description: 'View customers' },
    { module: 'finance', entity: 'customer', action: 'update', code: 'finance:customer:update', description: 'Update customers' },
    { module: 'finance', entity: 'customer', action: 'delete', code: 'finance:customer:delete', description: 'Delete customers' },
    { module: 'finance', entity: 'vendor', action: 'create', code: 'finance:vendor:create', description: 'Create vendors' },
    { module: 'finance', entity: 'vendor', action: 'read', code: 'finance:vendor:read', description: 'View vendors' },
    { module: 'finance', entity: 'vendor', action: 'update', code: 'finance:vendor:update', description: 'Update vendors' },
    { module: 'finance', entity: 'vendor', action: 'delete', code: 'finance:vendor:delete', description: 'Delete vendors' },
    { module: 'finance', entity: 'invoice', action: 'create', code: 'finance:invoice:create', description: 'Create invoices' },
    { module: 'finance', entity: 'invoice', action: 'read', code: 'finance:invoice:read', description: 'View invoices' },
    { module: 'finance', entity: 'invoice', action: 'update', code: 'finance:invoice:update', description: 'Update invoices' },
    { module: 'finance', entity: 'invoice', action: 'post', code: 'finance:invoice:post', description: 'Post invoices' },
    { module: 'finance', entity: 'invoice', action: 'delete', code: 'finance:invoice:delete', description: 'Delete invoices' },
    { module: 'finance', entity: 'bill', action: 'create', code: 'finance:bill:create', description: 'Create bills' },
    { module: 'finance', entity: 'bill', action: 'read', code: 'finance:bill:read', description: 'View bills' },
    { module: 'finance', entity: 'bill', action: 'update', code: 'finance:bill:update', description: 'Update bills' },
    { module: 'finance', entity: 'bill', action: 'post', code: 'finance:bill:post', description: 'Post bills' },
    { module: 'finance', entity: 'bill', action: 'delete', code: 'finance:bill:delete', description: 'Delete bills' },
    { module: 'finance', entity: 'receipt', action: 'create', code: 'finance:receipt:create', description: 'Create receipts' },
    { module: 'finance', entity: 'receipt', action: 'read', code: 'finance:receipt:read', description: 'View receipts' },
    { module: 'finance', entity: 'receipt', action: 'post', code: 'finance:receipt:post', description: 'Post receipts' },
    { module: 'finance', entity: 'receipt', action: 'delete', code: 'finance:receipt:delete', description: 'Delete receipts' },
    { module: 'finance', entity: 'chart-of-account', action: 'create', code: 'finance:chart-of-account:create', description: 'Create chart of accounts' },
    { module: 'finance', entity: 'chart-of-account', action: 'read', code: 'finance:chart-of-account:read', description: 'View chart of accounts' },
    { module: 'finance', entity: 'chart-of-account', action: 'update', code: 'finance:chart-of-account:update', description: 'Update chart of accounts' },
    { module: 'finance', entity: 'chart-of-account', action: 'delete', code: 'finance:chart-of-account:delete', description: 'Delete chart of accounts' },
    { module: 'finance', entity: 'journal-entry', action: 'create', code: 'finance:journal-entry:create', description: 'Create journal entries' },
    { module: 'finance', entity: 'journal-entry', action: 'read', code: 'finance:journal-entry:read', description: 'View journal entries' },
    { module: 'finance', entity: 'journal-entry', action: 'update', code: 'finance:journal-entry:update', description: 'Update journal entries' },
    { module: 'finance', entity: 'journal-entry', action: 'post', code: 'finance:journal-entry:post', description: 'Post journal entries' },
    { module: 'finance', entity: 'journal-entry', action: 'delete', code: 'finance:journal-entry:delete', description: 'Delete journal entries' },
    { module: 'finance', entity: 'bank-account', action: 'create', code: 'finance:bank-account:create', description: 'Create bank accounts' },
    { module: 'finance', entity: 'bank-account', action: 'read', code: 'finance:bank-account:read', description: 'View bank accounts' },
    { module: 'finance', entity: 'bank-account', action: 'update', code: 'finance:bank-account:update', description: 'Update bank accounts' },
    { module: 'finance', entity: 'bank-account', action: 'delete', code: 'finance:bank-account:delete', description: 'Delete bank accounts' },
    
    // SCM
    { module: 'scm', entity: 'item', action: 'create', code: 'scm:item:create', description: 'Create items' },
    { module: 'scm', entity: 'item', action: 'read', code: 'scm:item:read', description: 'View items' },
    { module: 'scm', entity: 'item', action: 'update', code: 'scm:item:update', description: 'Update items' },
    { module: 'scm', entity: 'item', action: 'delete', code: 'scm:item:delete', description: 'Delete items' },
    { module: 'scm', entity: 'warehouse', action: 'create', code: 'scm:warehouse:create', description: 'Create warehouses' },
    { module: 'scm', entity: 'warehouse', action: 'read', code: 'scm:warehouse:read', description: 'View warehouses' },
    { module: 'scm', entity: 'warehouse', action: 'update', code: 'scm:warehouse:update', description: 'Update warehouses' },
    { module: 'scm', entity: 'warehouse', action: 'delete', code: 'scm:warehouse:delete', description: 'Delete warehouses' },
    { module: 'scm', entity: 'purchase-order', action: 'create', code: 'scm:purchase-order:create', description: 'Create purchase orders' },
    { module: 'scm', entity: 'purchase-order', action: 'read', code: 'scm:purchase-order:read', description: 'View purchase orders' },
    { module: 'scm', entity: 'purchase-order', action: 'update', code: 'scm:purchase-order:update', description: 'Update purchase orders' },
    { module: 'scm', entity: 'purchase-order', action: 'approve', code: 'scm:purchase-order:approve', description: 'Approve purchase orders' },
    { module: 'scm', entity: 'purchase-order', action: 'delete', code: 'scm:purchase-order:delete', description: 'Delete purchase orders' },
    { module: 'scm', entity: 'grn', action: 'create', code: 'scm:grn:create', description: 'Create goods receipts' },
    { module: 'scm', entity: 'grn', action: 'read', code: 'scm:grn:read', description: 'View goods receipts' },
    { module: 'scm', entity: 'inventory', action: 'read', code: 'scm:inventory:read', description: 'View inventory' },
    
    // Asset
    { module: 'asset', entity: 'asset', action: 'create', code: 'asset:asset:create', description: 'Create assets' },
    { module: 'asset', entity: 'asset', action: 'read', code: 'asset:asset:read', description: 'View assets' },
    { module: 'asset', entity: 'asset', action: 'update', code: 'asset:asset:update', description: 'Update assets' },
    { module: 'asset', entity: 'asset', action: 'delete', code: 'asset:asset:delete', description: 'Delete assets' },
    { module: 'asset', entity: 'asset', action: 'depreciate', code: 'asset:asset:depreciate', description: 'Run depreciation' },
    
    // HRMS
    { module: 'hrms', entity: 'employee', action: 'create', code: 'hrms:employee:create', description: 'Create employees' },
    { module: 'hrms', entity: 'employee', action: 'read', code: 'hrms:employee:read', description: 'View employees' },
    { module: 'hrms', entity: 'employee', action: 'update', code: 'hrms:employee:update', description: 'Update employees' },
    { module: 'hrms', entity: 'employee', action: 'delete', code: 'hrms:employee:delete', description: 'Delete employees' },
    { module: 'hrms', entity: 'payroll', action: 'create', code: 'hrms:payroll:create', description: 'Create payroll runs' },
    { module: 'hrms', entity: 'payroll', action: 'read', code: 'hrms:payroll:read', description: 'View payroll' },
    { module: 'hrms', entity: 'payroll', action: 'approve', code: 'hrms:payroll:approve', description: 'Approve payroll' },
    
    // Manufacturing
    { module: 'manufacturing', entity: 'bom', action: 'create', code: 'manufacturing:bom:create', description: 'Create BOMs' },
    { module: 'manufacturing', entity: 'bom', action: 'read', code: 'manufacturing:bom:read', description: 'View BOMs' },
    { module: 'manufacturing', entity: 'bom', action: 'update', code: 'manufacturing:bom:update', description: 'Update BOMs' },
    { module: 'manufacturing', entity: 'bom', action: 'delete', code: 'manufacturing:bom:delete', description: 'Delete BOMs' },
    { module: 'manufacturing', entity: 'bom', action: 'approve', code: 'manufacturing:bom:approve', description: 'Approve BOMs' },
    { module: 'manufacturing', entity: 'production-order', action: 'create', code: 'manufacturing:production-order:create', description: 'Create production orders' },
    { module: 'manufacturing', entity: 'production-order', action: 'read', code: 'manufacturing:production-order:read', description: 'View production orders' },
    { module: 'manufacturing', entity: 'production-order', action: 'update', code: 'manufacturing:production-order:update', description: 'Update production orders' },
    { module: 'manufacturing', entity: 'production-order', action: 'delete', code: 'manufacturing:production-order:delete', description: 'Delete production orders' },
    { module: 'manufacturing', entity: 'production-order', action: 'start', code: 'manufacturing:production-order:start', description: 'Start production orders' },
    { module: 'manufacturing', entity: 'qc', action: 'create', code: 'manufacturing:qc:create', description: 'Create QC inspections' },
    { module: 'manufacturing', entity: 'qc', action: 'read', code: 'manufacturing:qc:read', description: 'View QC inspections' },
    
    // Reporting
    { module: 'reporting', entity: 'dashboard', action: 'read', code: 'reporting:dashboard:read', description: 'View dashboards' },
    { module: 'reporting', entity: 'financial', action: 'read', code: 'reporting:financial:read', description: 'View financial reports' },
    { module: 'reporting', entity: 'any', action: 'export', code: 'reporting:any:export', description: 'Export reports' },
  ];

  const permissions = await Promise.all(
    permissionsData.map((p) => prisma.permission.create({ data: p }))
  );

  // 5. Create Roles
  console.log('👥 Creating roles...');
  
  // Admin role with all permissions
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrator',
      code: 'ADMIN',
      description: 'Full system access',
      isSystem: true,
    },
  });

  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
  });

  // Finance User role
  const financeRole = await prisma.role.create({
    data: {
      name: 'Finance User',
      code: 'FINANCE_USER',
      description: 'AR/AP/GL operations',
      isSystem: true,
    },
  });

  const financePermissions = permissions.filter(
    (p) => p.module === 'finance' || p.code === 'report:financial:read' || p.code === 'report:dashboard:read'
  );

  await prisma.rolePermission.createMany({
    data: financePermissions.map((p) => ({
      roleId: financeRole.id,
      permissionId: p.id,
    })),
  });

  // Supply Chain User role
  const scmRole = await prisma.role.create({
    data: {
      name: 'Supply Chain User',
      code: 'SCM_USER',
      description: 'Inventory and procurement operations',
      isSystem: true,
    },
  });

  const scmPermissions = permissions.filter(
    (p) => p.module === 'scm' || p.code === 'report:dashboard:read'
  );

  await prisma.rolePermission.createMany({
    data: scmPermissions.map((p) => ({
      roleId: scmRole.id,
      permissionId: p.id,
    })),
  });

  // Viewer role
  const viewerRole = await prisma.role.create({
    data: {
      name: 'Viewer',
      code: 'VIEWER',
      description: 'Read-only access',
      isSystem: true,
    },
  });

  const viewerPermissions = permissions.filter((p) => p.action === 'read');

  await prisma.rolePermission.createMany({
    data: viewerPermissions.map((p) => ({
      roleId: viewerRole.id,
      permissionId: p.id,
    })),
  });

  // 6. Create Admin User
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('Admin@123!', 12);

  const adminUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      branchId: headOfficeBranch.id,
      email: 'admin@iteck.pk',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true,
      preferences: {
        language: 'en',
        theme: 'light',
      },
    },
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // 7. Create Document Sequences
  console.log('📋 Creating document sequences...');
  await prisma.documentSequence.createMany({
    data: [
      // Head Office sequences
      {
        branchId: headOfficeBranch.id,
        module: 'finance',
        documentType: 'INVOICE',
        prefix: 'INV-HO-',
        nextNumber: 1,
        padding: 5,
      },
      {
        branchId: headOfficeBranch.id,
        module: 'finance',
        documentType: 'RECEIPT',
        prefix: 'RCP-HO-',
        nextNumber: 1,
        padding: 5,
      },
      {
        branchId: headOfficeBranch.id,
        module: 'finance',
        documentType: 'JOURNAL',
        prefix: 'JE-HO-',
        nextNumber: 1,
        padding: 5,
      },
      {
        branchId: headOfficeBranch.id,
        module: 'scm',
        documentType: 'PO',
        prefix: 'PO-HO-',
        nextNumber: 1,
        padding: 5,
      },
      {
        branchId: headOfficeBranch.id,
        module: 'scm',
        documentType: 'GRN',
        prefix: 'GRN-HO-',
        nextNumber: 1,
        padding: 5,
      },
      // Lahore Branch sequences
      {
        branchId: lahoreBranch.id,
        module: 'finance',
        documentType: 'INVOICE',
        prefix: 'INV-LHR-',
        nextNumber: 1,
        padding: 5,
      },
      {
        branchId: lahoreBranch.id,
        module: 'finance',
        documentType: 'RECEIPT',
        prefix: 'RCP-LHR-',
        nextNumber: 1,
        padding: 5,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Organization: ${organization.name}`);
  console.log(`   Branches: 2 (Head Office, Lahore)`);
  console.log(`   Service Offerings: 5`);
  console.log(`   Permissions: ${permissions.length}`);
  console.log(`   Roles: 4 (Admin, Finance User, SCM User, Viewer)`);
  console.log(`   Admin User: admin@iteck.pk (Password: Admin@123!)`);
  console.log('\n🚀 You can now start the application!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
