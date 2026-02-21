import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Creating workflow roles for requisition approvals...');

  const workflowRoles = [
    { code: 'HOD', name: 'Head of Department', description: 'Head of Department - approves requisitions from their department' },
    { code: 'PROCUREMENT_COMMITTEE', name: 'Procurement Committee', description: 'Procurement Committee - reviews and approves procurement requisitions' },
    { code: 'PROCUREMENT_TEAM', name: 'Procurement Team', description: 'Procurement Team - collects quotations and executes requisitions' },
    { code: 'CEO', name: 'Chief Executive Officer', description: 'CEO - final approval for high-value requisitions' },
    { code: 'HR', name: 'Human Resources', description: 'HR - approves HR-related requisitions like loans and advances' },
    { code: 'FINANCE', name: 'Finance', description: 'Finance Department - approves financial requisitions' },
    { code: 'DEPARTMENT_ADMIN', name: 'Department Admin', description: 'Department Admin - administrative approvals' },
    { code: 'EXECUTION_TEAM', name: 'Execution Team', description: 'Execution Team - executes approved requisitions' },
  ];

  for (const roleData of workflowRoles) {
    const existing = await prisma.role.findFirst({
      where: { code: roleData.code },
    });

    if (existing) {
      console.log(`   ✅ Role ${roleData.code} already exists`);
    } else {
      await prisma.role.create({
        data: {
          ...roleData,
          isSystem: true,
        },
      });
      console.log(`   ✅ Created role: ${roleData.code} - ${roleData.name}`);
    }
  }

  console.log('\n✅ All workflow roles created successfully!');
  console.log('\n📋 Workflow Roles:');
  console.log('   • HOD - Head of Department');
  console.log('   • PROCUREMENT_COMMITTEE - Procurement Committee (can have 2-3 users)');
  console.log('   • PROCUREMENT_TEAM - Procurement Team');
  console.log('   • CEO - Chief Executive Officer');
  console.log('   • HR - Human Resources');
  console.log('   • FINANCE - Finance Department');
  console.log('   • DEPARTMENT_ADMIN - Department Admin');
  console.log('   • EXECUTION_TEAM - Execution Team');
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
