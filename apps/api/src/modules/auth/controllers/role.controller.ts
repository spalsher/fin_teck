import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { RoleService } from '../services/role.service';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';

class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissionIds?: string[];
}

class UpdateRoleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class AssignPermissionsDto {
  @IsArray()
  permissionIds: string[];
}

@ApiTags('auth')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_READ)
  @ApiOperation({ summary: 'List all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved' })
  async findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_READ)
  @ApiOperation({ summary: 'Get role details' })
  @ApiResponse({ status: 200, description: 'Role retrieved' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_CREATE)
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created' })
  async create(@Body() createDto: CreateRoleDto) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role.controller.ts:create:entry',message:'POST /roles called',data:{dto:createDto},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
    // #endregion
    
    try {
      const result = await this.roleService.create(createDto);
      
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role.controller.ts:create:success',message:'Role created',data:{roleId:result.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      
      return result;
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7247/ingest/02c3462f-df31-4a0e-a26e-c4ff326b3313',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'role.controller.ts:create:error',message:'Role creation failed',data:{error:error.message,stack:error.stack,dto:createDto},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_UPDATE)
  @ApiOperation({ summary: 'Update role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateRoleDto) {
    return this.roleService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_DELETE)
  @ApiOperation({ summary: 'Delete role' })
  @ApiResponse({ status: 200, description: 'Role deleted' })
  async delete(@Param('id') id: string) {
    return this.roleService.delete(id);
  }

  @Post(':id/permissions')
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_UPDATE)
  @ApiOperation({ summary: 'Assign permissions to role' })
  @ApiResponse({ status: 200, description: 'Permissions assigned' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignDto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(id, assignDto.permissionIds);
  }

  @Get(':id/users')
  @RequirePermissions(PERMISSIONS.AUTH_ROLE_READ)
  @ApiOperation({ summary: 'Get users with role' })
  @ApiResponse({ status: 200, description: 'Users retrieved' })
  async getRoleUsers(@Param('id') id: string) {
    return this.roleService.getRoleUsers(id);
  }
}
