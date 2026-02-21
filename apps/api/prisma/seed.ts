import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PERMISSIONS } from '@iteck/shared';

const prisma = new PrismaClient();

function permissionCodeToRecord(code: string) {
  const [module, entity, action] = code.split(':');
  return { code, module: module || 'core', entity: entity || 'app', action: action || 'read', description: `${module}/${entity} ${action}` };
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (development only)
  console.log('🗑️  Cleaning existing data...');
  await prisma.$transaction([
    // Delete in order: child tables first, then parent tables
    prisma.auditLog.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.rolePermission.deleteMany(),
    // Requisition-related tables (child tables first)
    prisma.quotation.deleteMany(),
    prisma.requisitionApprovalLog.deleteMany(),
    prisma.requisitionItem.deleteMany(),
    prisma.requisition.deleteMany(),
    prisma.categoryApprovalStep.deleteMany(),
    prisma.requisitionCategory.deleteMany(),
    // HRMS/Employee-related tables (must be before branches)
    prisma.employee.deleteMany(),
    prisma.department.deleteMany(),
    // Other tables
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

  // 2. Create Branch
  console.log('🏪 Creating branch...');
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

  // 3. Create Admin Role
  console.log('👥 Creating admin role...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrator',
      code: 'ADMIN',
      description: 'Full system access',
      isSystem: true,
    },
  });

  // 4. Create Admin User (email must be lowercase - login lookup is case-insensitive but DB stores as-is)
  console.log('👤 Creating admin user...');
  const adminPassword = 'Admin@123!';
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const adminUser = await prisma.user.create({
    data: {
      organizationId: organization.id,
      branchId: headOfficeBranch.id,
      email: 'admin@iteck.pk'.toLowerCase(),
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

  // Create all permissions from shared PERMISSIONS (legacy-compatible + full stack) and assign to ADMIN
  console.log('🔐 Creating permissions and assigning to ADMIN role...');
  const permissionCodes = [...new Set(Object.values(PERMISSIONS) as string[])];
  for (const code of permissionCodes) {
    const { module, entity, action, description } = permissionCodeToRecord(code);
    const perm = await prisma.permission.upsert({
      where: { code },
      update: { module, entity, action, description },
      create: { code, module, entity, action, description },
    });
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Department (required for employees and requisition flow)
  console.log('🏢 Creating default department...');
  const defaultDept = await prisma.department.create({
    data: {
      organizationId: organization.id,
      branchId: headOfficeBranch.id,
      code: 'ADMIN',
      name: 'Administration',
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  // Employee linked to admin user (required for requisition flow: create, history, pending)
  console.log('👤 Creating admin employee and linking to admin user...');
  const adminEmployee = await prisma.employee.create({
    data: {
      organizationId: organization.id,
      branchId: headOfficeBranch.id,
      employeeCode: 'ADMIN-001',
      firstName: 'System',
      lastName: 'Administrator',
      email: adminUser.email,
      hireDate: new Date(),
      departmentId: defaultDept.id,
      status: 'ACTIVE',
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  await prisma.user.update({
    where: { id: adminUser.id },
    data: { employeeId: adminEmployee.id },
  });

  // Requisition category (required for flow create)
  console.log('📋 Creating default requisition category...');
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'GEN',
      name: 'General',
      executionDept: 'PROCUREMENT',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  // Document sequence for requisition numbers
  console.log('🔢 Creating requisition document sequence...');
  await prisma.documentSequence.create({
    data: {
      branchId: headOfficeBranch.id,
      module: 'REQUISITION',
      documentType: 'REQ',
      prefix: 'REQ',
      nextNumber: 1,
      padding: 5,
    },
  });

  console.log('\n✅ Seed completed successfully!');
  console.log(`   Organization: ${organization.name} (${organization.code})`);
  console.log(`   Branch: ${headOfficeBranch.name} (${headOfficeBranch.code})`);
  console.log(`   Admin User: ${adminUser.email} (linked to employee ${adminEmployee.employeeCode})`);
  console.log(`   Password: Admin@123!`);
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
