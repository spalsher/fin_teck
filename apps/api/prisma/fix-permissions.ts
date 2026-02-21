import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Fixing permissions for admin user...');

  // Step 1: Find admin user and role
  const adminUser = await prisma.user.findFirst({
    where: { email: 'admin@iteck.pk' },
    include: { userRoles: { include: { role: true } } },
  });

  if (!adminUser) {
    throw new Error('Admin user not found. Please create admin user first.');
  }

  console.log(`   ✅ Found admin user: ${adminUser.email}`);

  // Find or create ADMIN role
  let adminRole = await prisma.role.findFirst({
    where: { code: 'ADMIN' },
  });

  if (!adminRole) {
    console.log('   📝 Creating ADMIN role...');
    adminRole = await prisma.role.create({
      data: {
        name: 'Administrator',
        code: 'ADMIN',
        description: 'Full system administrator with all permissions',
        isSystem: true,
      },
    });
    console.log('   ✅ Created ADMIN role');
  } else {
    console.log(`   ✅ Found ADMIN role: ${adminRole.name}`);
  }

  // Step 2: Ensure admin user has ADMIN role
  const userRole = await prisma.userRole.findFirst({
    where: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  if (!userRole) {
    console.log('   📝 Assigning ADMIN role to admin user...');
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
    console.log('   ✅ Assigned ADMIN role to admin user');
  } else {
    console.log('   ✅ Admin user already has ADMIN role');
  }

  // Step 3: Create HRMS_DEPARTMENT_CREATE permission if it doesn't exist
  let deptCreatePermission = await prisma.permission.findFirst({
    where: { code: 'HRMS_DEPARTMENT_CREATE' },
  });

  if (!deptCreatePermission) {
    console.log('   📝 Creating HRMS_DEPARTMENT_CREATE permission...');
    deptCreatePermission = await prisma.permission.create({
      data: {
        module: 'hrms',
        entity: 'department',
        action: 'create',
        code: 'HRMS_DEPARTMENT_CREATE',
        description: 'Create departments',
      },
    });
    console.log('   ✅ Created HRMS_DEPARTMENT_CREATE permission');
  } else {
    console.log('   ✅ HRMS_DEPARTMENT_CREATE permission already exists');
  }

  // Step 4: Assign permission to ADMIN role
  const rolePermission = await prisma.rolePermission.findFirst({
    where: {
      roleId: adminRole.id,
      permissionId: deptCreatePermission.id,
    },
  });

  if (!rolePermission) {
    console.log('   📝 Assigning HRMS_DEPARTMENT_CREATE to ADMIN role...');
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: deptCreatePermission.id,
      },
    });
    console.log('   ✅ Assigned HRMS_DEPARTMENT_CREATE to ADMIN role');
  } else {
    console.log('   ✅ ADMIN role already has HRMS_DEPARTMENT_CREATE permission');
  }

  // Step 5: Create all other HRMS department permissions if missing
  const hrmsDeptPermissions = [
    { code: 'HRMS_DEPARTMENT_READ', action: 'read', description: 'View departments' },
    { code: 'HRMS_DEPARTMENT_UPDATE', action: 'update', description: 'Update departments' },
    { code: 'HRMS_DEPARTMENT_DELETE', action: 'delete', description: 'Delete departments' },
  ];

  for (const perm of hrmsDeptPermissions) {
    let permission = await prisma.permission.findFirst({
      where: { code: perm.code },
    });

    if (!permission) {
      permission = await prisma.permission.create({
        data: {
          module: 'hrms',
          entity: 'department',
          action: perm.action,
          code: perm.code,
          description: perm.description,
        },
      });
      console.log(`   ✅ Created ${perm.code} permission`);
    }

    const rp = await prisma.rolePermission.findFirst({
      where: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });

    if (!rp) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`   ✅ Assigned ${perm.code} to ADMIN role`);
    }
  }

  // Step 6: Employee permissions (fixes 403 on Employees page)
  const employeePermissions = [
    { code: 'hrms:employee:create', module: 'hrms', entity: 'employee', action: 'create', description: 'Create employees' },
    { code: 'hrms:employee:read', module: 'hrms', entity: 'employee', action: 'read', description: 'View employees' },
    { code: 'hrms:employee:update', module: 'hrms', entity: 'employee', action: 'update', description: 'Update employees' },
    { code: 'hrms:employee:delete', module: 'hrms', entity: 'employee', action: 'delete', description: 'Delete employees' },
  ];

  for (const p of employeePermissions) {
    let permission = await prisma.permission.findFirst({
      where: { code: p.code },
    });
    if (!permission) {
      permission = await prisma.permission.create({ data: p });
      console.log(`   ✅ Created ${p.code} permission`);
    }
    const rp = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: permission.id },
    });
    if (!rp) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: permission.id },
      });
      console.log(`   ✅ Assigned ${p.code} to ADMIN role`);
    }
  }

  // Step 7: Designation permissions
  const designationPermissions = [
    { code: 'HRMS_DESIGNATION_CREATE', module: 'hrms', entity: 'designation', action: 'create', description: 'Create designations' },
    { code: 'HRMS_DESIGNATION_READ', module: 'hrms', entity: 'designation', action: 'read', description: 'View designations' },
    { code: 'HRMS_DESIGNATION_UPDATE', module: 'hrms', entity: 'designation', action: 'update', description: 'Update designations' },
    { code: 'HRMS_DESIGNATION_DELETE', module: 'hrms', entity: 'designation', action: 'delete', description: 'Delete designations' },
  ];
  for (const p of designationPermissions) {
    let permission = await prisma.permission.findFirst({ where: { code: p.code } });
    if (!permission) {
      permission = await prisma.permission.create({ data: p });
      console.log(`   ✅ Created ${p.code} permission`);
    }
    const rp = await prisma.rolePermission.findFirst({
      where: { roleId: adminRole.id, permissionId: permission.id },
    });
    if (!rp) {
      await prisma.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: permission.id },
      });
      console.log(`   ✅ Assigned ${p.code} to ADMIN role`);
    }
  }

  console.log('\n✅ Permissions fixed successfully!');
  console.log('   • Admin user has ADMIN role');
  console.log('   • ADMIN role has HRMS department, employee, and designation permissions');
  console.log('\n🔄 Log out and log back in (or refresh token) for changes to take effect.');
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
