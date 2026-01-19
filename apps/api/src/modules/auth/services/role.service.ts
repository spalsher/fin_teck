import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const roles = await this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return roles.map(role => ({
      ...role,
      userCount: role._count.userRoles,
      permissions: role.rolePermissions.map(rp => rp.permission),
    }));
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return {
      ...role,
      permissions: role.rolePermissions.map(rp => rp.permission),
      users: role.userRoles.map(ur => ur.user),
    };
  }

  async create(data: {
    name: string;
    code: string;
    description?: string;
    permissionIds?: string[];
  }) {
    // Check if code already exists
    const existing = await this.prisma.role.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictException('Role code already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        isSystem: false,
      },
    });

    // Assign permissions if provided
    if (data.permissionIds && data.permissionIds.length > 0) {
      await this.assignPermissions(role.id, data.permissionIds);
    }

    return this.findOne(role.id);
  }

  async update(id: string, data: {
    name?: string;
    description?: string;
  }) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system role');
    }

    const updated = await this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return this.findOne(updated.id);
  }

  async delete(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system role');
    }

    if (role._count.userRoles > 0) {
      throw new BadRequestException('Cannot delete role with assigned users');
    }

    await this.prisma.role.delete({ where: { id } });

    return { message: 'Role deleted successfully' };
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Verify all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('One or more permissions not found');
    }

    // Remove existing permissions
    await this.prisma.rolePermission.deleteMany({
      where: { roleId },
    });

    // Add new permissions
    await this.prisma.rolePermission.createMany({
      data: permissionIds.map(permissionId => ({
        roleId,
        permissionId,
      })),
    });

    return this.findOne(roleId);
  }

  async getRoleUsers(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role.userRoles.map(ur => ur.user);
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Aggregate all permissions from all roles
    const permissionSet = new Set<string>();

    userRoles.forEach(ur => {
      ur.role.rolePermissions.forEach(rp => {
        const permKey = `${rp.permission.module}:${rp.permission.entity}:${rp.permission.action}`;
        permissionSet.add(permKey);
      });
    });

    return Array.from(permissionSet);
  }
}
