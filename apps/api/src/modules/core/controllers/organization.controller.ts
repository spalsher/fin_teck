import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OrganizationService } from '../services/organization.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';
import { UpdateOrganizationDto } from '@iteck/shared';

@ApiTags('core')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CORE_ORG_READ)
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, description: 'Organization retrieved' })
  async findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.CORE_ORG_UPDATE)
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationService.update(id, updateDto, userId);
  }
}
