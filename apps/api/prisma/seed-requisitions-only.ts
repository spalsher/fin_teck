import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting requisition-only seed...');

  // Step 1: Clean only requisition-related data (if exists)
  console.log('🗑️  Cleaning existing requisition data...');
  try {
    await prisma.$transaction([
      prisma.quotation.deleteMany(),
      prisma.requisitionApprovalLog.deleteMany(),
      prisma.requisition.deleteMany(),
      prisma.categoryApprovalStep.deleteMany(),
      prisma.requisitionCategory.deleteMany(),
    ]);
    console.log('   ✅ Cleaned existing requisition data');
  } catch (error) {
    console.log('   ℹ️  No existing requisition data to clean (this is OK)');
  }

  // Step 2: Get existing organization and admin user
  console.log('🔍 Finding existing organization and admin user...');
  const organization = await prisma.organization.findFirst({
    where: { code: 'ITECK' },
  });

  if (!organization) {
    throw new Error('Organization with code "ITECK" not found. Please run full seed first or create organization manually.');
  }

  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@iteck.pk' },
  });

  if (!adminUser) {
    throw new Error('Admin user with email "admin@iteck.pk" not found. Please run full seed first or create admin user manually.');
  }

  console.log(`   ✅ Found organization: ${organization.name}`);
  console.log(`   ✅ Found admin user: ${adminUser.email}`);

  // Step 3: Create Requisition Categories with Workflows
  console.log('📋 Creating requisition categories from Excel hierarchy...');

  // 1. Stationary
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'STATIONARY',
      name: 'Stationary',
      description: 'Stationary requisitions',
      executionDept: 'ADMIN',
      requiresQuotation: false,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'INFO', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'DEPARTMENT_ADMIN', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'EXECUTION_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
        ],
      },
    },
  });

  // 2. Vehicle Maintenance
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'VEHICLE_MAINTENANCE',
      name: 'Vehicle Maintenance',
      description: 'Vehicle Maintenance requisitions',
      executionDept: 'ADMIN',
      requiresQuotation: false,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'INFO', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'DEPARTMENT_ADMIN', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'EXECUTION_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
        ],
      },
    },
  });

  // 3. Vehicle Repair
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'VEHICLE_REPAIR',
      name: 'Vehicle Repair',
      description: 'Vehicle Repair requisitions',
      executionDept: 'ADMIN',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'INFO', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'DEPARTMENT_ADMIN', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true },
          { sequenceNumber: 5, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 7, roleCode: 'EXECUTION_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
        ],
      },
    },
  });

  // 4. Other Repair & Maintenance
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'OTHER_REPAIR_MAINTENANCE',
      name: 'Other Repair & Maintenance',
      description: 'Other Repair & Maintenance requisitions',
      executionDept: 'ADMIN',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'INFO', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'DEPARTMENT_ADMIN', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true },
          { sequenceNumber: 5, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 7, roleCode: 'EXECUTION_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
        ],
      },
    },
  });

  // 5. Loan & Advance Salary
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'LOAN_ADVANCE_SALARY',
      name: 'Loan & Advance Salary',
      description: 'Loan and Advance Salary requisitions',
      executionDept: 'FINANCE',
      requiresQuotation: false,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'HR', approvalType: 'CONDITIONAL', maxAmount: 50000, isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'FINANCE', approvalType: 'CONDITIONAL', maxAmount: 50000, isMandatory: true, isActive: true },
          { sequenceNumber: 4, roleCode: 'CEO', approvalType: 'CONDITIONAL', minAmount: 50001, isMandatory: true, isActive: true },
          { sequenceNumber: 5, roleCode: 'FINANCE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
        ],
      },
    },
  });

  // 6. Event
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'EVENT',
      name: 'Event',
      description: 'Event requisitions',
      executionDept: 'PROCUREMENT',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true }, // Collect 3 quotations
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Final review
          { sequenceNumber: 5, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'PROCUREMENT_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Execute
        ],
      },
    },
  });

  // 7. Specialized Projects
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'SPECIALIZED_PROJECTS',
      name: 'Specialized Projects',
      description: 'Specialized Projects requisitions',
      executionDept: 'PROCUREMENT',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true }, // Collect 3 quotations
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Final review
          { sequenceNumber: 5, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'PROCUREMENT_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Execute
        ],
      },
    },
  });

  // 8. IT Equipments
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'IT_EQUIPMENTS',
      name: 'IT Equipments',
      description: 'IT Equipments requisitions - HOD for info, Committee/Finance for approval',
      executionDept: 'PROCUREMENT',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'INFO', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true }, // Collect 3 quotations
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Final review
          { sequenceNumber: 5, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'PROCUREMENT_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Execute
        ],
      },
    },
  });

  // 9. General Procurements - Grocery & Others
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'GENERAL_PROC_GROCERY',
      name: 'General Procurements - Grocery & Others',
      description: 'General Procurements - Grocery & Others requisitions',
      executionDept: 'PROCUREMENT',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true }, // Collect 3 quotations
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Final review
          { sequenceNumber: 5, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'PROCUREMENT_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Execute
        ],
      },
    },
  });

  // 10. General Procurements - Electric Appliances
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'GENERAL_PROC_APPLIANCES',
      name: 'General Procurements - Electric Appliances',
      description: 'General Procurements - Electric Appliances requisitions',
      executionDept: 'PROCUREMENT',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true }, // Collect 3 quotations
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Final review
          { sequenceNumber: 5, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'PROCUREMENT_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Execute
        ],
      },
    },
  });

  // 11. Devices / Accessories
  await prisma.requisitionCategory.create({
    data: {
      organizationId: organization.id,
      code: 'DEVICES_ACCESSORIES',
      name: 'Devices / Accessories',
      description: 'Devices / Accessories requisitions',
      executionDept: 'PROCUREMENT',
      requiresQuotation: true,
      isActive: true,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      approvalSteps: {
        create: [
          { sequenceNumber: 1, roleCode: 'HOD', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 2, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 3, roleCode: 'PROCUREMENT_TEAM', approvalType: 'INFO', isMandatory: true, isActive: true }, // Collect 3 quotations
          { sequenceNumber: 4, roleCode: 'PROCUREMENT_COMMITTEE', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Final review
          { sequenceNumber: 5, roleCode: 'CEO', approvalType: 'APPROVAL', isMandatory: true, isActive: true },
          { sequenceNumber: 6, roleCode: 'PROCUREMENT_TEAM', approvalType: 'APPROVAL', isMandatory: true, isActive: true }, // Execute
        ],
      },
    },
  });

  console.log('   ✅ Created 11 requisition categories with complete workflows');
  console.log('\n📊 Summary:');
  console.log(`   • Requisition Categories: 11`);
  console.log(`   • All workflows configured with approval steps`);
  console.log(`   • Based on Excel: Employee Request Hierarchy for Procurements and Requisition`);
  console.log('\n🚀 Requisition module is ready to use!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
