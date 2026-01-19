import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { PERMISSIONS } from '@iteck/shared';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [
        { module: 'asc' },
        { entity: 'asc' },
        { action: 'asc' },
      ],
    });
  }

  async getGroupedPermissions() {
    const permissions = await this.findAll();

    // Group by module
    const grouped: Record<string, Record<string, any[]>> = {};

    permissions.forEach(perm => {
      if (!grouped[perm.module]) {
        grouped[perm.module] = {};
      }
      if (!grouped[perm.module][perm.entity]) {
        grouped[perm.module][perm.entity] = [];
      }
      grouped[perm.module][perm.entity].push(perm);
    });

    return grouped;
  }

  async seedPermissions() {
    // Seed all permissions from the PERMISSIONS constant
    const permissionEntries = Object.entries(PERMISSIONS);

    for (const [key, value] of permissionEntries) {
      const [module, entity, action] = value.split(':');

      await this.prisma.permission.upsert({
        where: { code: value },
        update: {
          module,
          entity,
          action,
          description: key.replace(/_/g, ' ').toLowerCase(),
        },
        create: {
          code: value,
          module,
          entity,
          action,
          description: key.replace(/_/g, ' ').toLowerCase(),
        },
      });
    }

    return { message: 'Permissions seeded successfully' };
  }
}
