import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Checking and fixing admin user password...');

  const adminEmail = 'admin@iteck.pk';
  const adminPassword = 'Admin@123!';

  // Find admin user
  const adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: {
      organization: true,
      branch: true,
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!adminUser) {
    console.log('❌ Admin user not found!');
    console.log('   Creating admin user...');

    // Find organization
    const organization = await prisma.organization.findFirst({
      where: { code: 'ITECK' },
    });

    if (!organization) {
      throw new Error('Organization with code "ITECK" not found. Please run seed first.');
    }

    // Find branch
    const branch = await prisma.branch.findFirst({
      where: { code: 'HO' },
    });

    if (!branch) {
      throw new Error('Branch with code "HO" not found. Please run seed first.');
    }

    // Find or create ADMIN role
    let adminRole = await prisma.role.findFirst({
      where: { code: 'ADMIN' },
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'Administrator',
          code: 'ADMIN',
          description: 'Full system access',
          isSystem: true,
        },
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const newAdminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        organizationId: organization.id,
        branchId: branch.id,
        isActive: true,
      },
    });

    // Assign ADMIN role
    await prisma.userRole.create({
      data: {
        userId: newAdminUser.id,
        roleId: adminRole.id,
      },
    });

    console.log('   ✅ Admin user created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    return;
  }

  console.log(`   ✅ Found admin user: ${adminEmail}`);
  console.log(`   Organization: ${adminUser.organization?.name || 'N/A'}`);
  console.log(`   Branch: ${adminUser.branch?.name || 'N/A'}`);
  console.log(`   Is Active: ${adminUser.isActive}`);
  console.log(`   Roles: ${adminUser.userRoles.map(ur => ur.role.code).join(', ') || 'None'}`);

  // Test password
  console.log('\n🔍 Testing password...');
  const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.passwordHash);

  if (isPasswordValid) {
    console.log('   ✅ Password is correct!');
  } else {
    console.log('   ❌ Password is incorrect!');
    console.log('   🔄 Resetting password...');

    const newPasswordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { passwordHash: newPasswordHash },
    });

    console.log('   ✅ Password reset successfully!');
  }

  // Ensure user is active
  if (!adminUser.isActive) {
    console.log('\n⚠️  User is inactive. Activating...');
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { isActive: true },
    });
    console.log('   ✅ User activated!');
  }

  // Ensure user has ADMIN role
  const hasAdminRole = adminUser.userRoles.some(ur => ur.role.code === 'ADMIN');
  if (!hasAdminRole) {
    console.log('\n⚠️  User does not have ADMIN role. Assigning...');
    
    let adminRole = await prisma.role.findFirst({
      where: { code: 'ADMIN' },
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'Administrator',
          code: 'ADMIN',
          description: 'Full system access',
          isSystem: true,
        },
      });
    }

    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    console.log('   ✅ ADMIN role assigned!');
  }

  console.log('\n✅ Admin user is ready!');
  console.log(`\n📋 Login Credentials:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`\n⚠️  Note: Password is case-sensitive!`);
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
