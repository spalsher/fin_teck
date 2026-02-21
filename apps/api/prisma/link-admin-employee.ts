/**
 * Links the admin user (admin@iteck.pk) to an employee so Requisition page works.
 * Run from apps/api: npx ts-node prisma/link-admin-employee.ts
 * Does not wipe data; creates department and employee only if missing, then links user.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔗 Linking admin user to employee...');

  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@iteck.pk' },
    include: { branch: true },
  });

  if (!adminUser) {
    console.error('❌ Admin user (admin@iteck.pk) not found. Run the seed first.');
    process.exit(1);
  }

  if (adminUser.employeeId) {
    console.log('✅ Admin user is already linked to employee:', adminUser.employeeId);
    process.exit(0);
  }

  const organizationId = adminUser.organizationId;
  const branchId = adminUser.branchId;
  if (!branchId) {
    console.error('❌ Admin user has no branch. Run the seed first.');
    process.exit(1);
  }

  let dept = await prisma.department.findFirst({
    where: { organizationId, code: 'ADMIN' },
  });
  if (!dept) {
    console.log('   Creating Administration department...');
    dept = await prisma.department.create({
      data: {
        organizationId,
        branchId,
        code: 'ADMIN',
        name: 'Administration',
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
    });
    console.log('   ✅ Created department:', dept.name);
  }

  let employee = await prisma.employee.findFirst({
    where: { organizationId, employeeCode: 'ADMIN-001' },
  });
  if (!employee) {
    console.log('   Creating admin employee (ADMIN-001)...');
    employee = await prisma.employee.create({
      data: {
        organizationId,
        branchId,
        employeeCode: 'ADMIN-001',
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        hireDate: new Date(),
        departmentId: dept.id,
        status: 'ACTIVE',
        createdBy: adminUser.id,
        updatedBy: adminUser.id,
      },
    });
    console.log('   ✅ Created employee:', employee.employeeCode);
  }

  await prisma.user.update({
    where: { id: adminUser.id },
    data: { employeeId: employee.id },
  });
  console.log('✅ Admin user linked to employee:', employee.id);
  console.log('\n🔄 Log out and log in again (or refresh the Requisition page) for the change to take effect.');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
