import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../shared/database/prisma.service';
import { JwtPayload } from '@iteck/shared';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const normalizedEmail = email?.trim?.()?.toLowerCase?.() || email;
    if (!normalizedEmail || !password) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        organization: true,
        branch: true,
        userRoles: {
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
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive. Please contact administrator.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Extract permissions
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.code)
    );


    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizationId: user.organizationId,
      branchId: user.branchId,
      permissions,
    };
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      branchId: user.branchId,
      permissions: user.permissions,
    };


    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        organizationId: user.organizationId,
        branchId: user.branchId,
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            userRoles: {
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
            },
          },
        },
      },
    });

    if (!tokenRecord || tokenRecord.isRevoked) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = tokenRecord.user;

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Extract permissions
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.code)
    );

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      branchId: user.branchId,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        token: refreshToken,
      },
      data: {
        isRevoked: true,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password changed successfully' };
  }

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationId: string,
    branchId?: string,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        organizationId,
        branchId,
        isActive: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get('REFRESH_TOKEN_SECRET', 'default-refresh-secret-change-in-production'),
        expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES_IN', '7d'),
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        isRevoked: false,
      },
    });

    return token;
  }

  async getMe(userId: string) {
    let user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        branchId: true,
        employeeId: true,
        isActive: true,
        preferences: true,
        lastLogin: true,
        createdAt: true,
        organization: { select: { id: true, name: true, code: true } },
        branch: { select: { id: true, name: true, code: true } },
        userRoles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                code: true,
                rolePermissions: {
                  include: {
                    permission: { select: { id: true, code: true, module: true, entity: true, action: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.employeeId) {
      try {
        const { employeeId } = await this.ensureEmployee(userId);
        user = { ...user, employeeId } as typeof user;
      } catch {
        // ignore; return user without employeeId
      }
    }

    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.code)
    );
    const uniquePermissions = [...new Set(permissions)];

    return {
      ...user,
      roles: user.userRoles.map((ur) => ({ id: ur.role.id, name: ur.role.name, code: ur.role.code })),
      permissions: uniquePermissions,
    };
  }

  /**
   * Ensure the current user has an employee record (for Requisition flow).
   * If user.employeeId is null, creates department + employee and links user.
   */
  async ensureEmployee(userId: string): Promise<{ employeeId: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, employeeId: true, organizationId: true, branchId: true, email: true, firstName: true, lastName: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.employeeId) return { employeeId: user.employeeId };

    const organizationId = user.organizationId;
    let branchId = user.branchId;
    if (!branchId) {
      let branch = await this.prisma.branch.findFirst({ where: { organizationId }, select: { id: true } });
      if (!branch) {
        const org = await this.prisma.organization.findUnique({ where: { id: organizationId }, select: { code: true } });
        branch = await this.prisma.branch.create({
          data: {
            organizationId,
            name: 'Head Office',
            code: org?.code ? `${org.code}-HO` : 'HO',
            address: {},
            isHeadOffice: true,
            isActive: true,
          },
        });
      }
      branchId = branch.id;
    }

    let dept = await this.prisma.department.findFirst({
      where: { organizationId, code: 'ADMIN' },
    });
    if (!dept) {
      dept = await this.prisma.department.create({
        data: {
          organizationId,
          branchId,
          code: 'ADMIN',
          name: 'Administration',
          createdBy: userId,
          updatedBy: userId,
        },
      });
    }

    let employee = await this.prisma.employee.findFirst({
      where: { organizationId, email: user.email },
      select: { id: true },
    });
    if (!employee) {
      employee = await this.prisma.employee.create({
        data: {
          organizationId,
          branchId,
          employeeCode: `EMP-${Date.now().toString(36).toUpperCase()}`,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          hireDate: new Date(),
          departmentId: dept.id,
          status: 'ACTIVE',
          createdBy: userId,
          updatedBy: userId,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { employeeId: employee.id },
    });
    return { employeeId: employee.id };
  }
}
