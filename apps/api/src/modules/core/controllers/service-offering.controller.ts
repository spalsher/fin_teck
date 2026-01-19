import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ServiceOfferingService } from '../services/service-offering.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS, PaginationDto } from '@iteck/shared';
import { CreateServiceOfferingDto, UpdateServiceOfferingDto } from '@iteck/shared';

@ApiTags('core')
@ApiBearerAuth()
@Controller('service-offerings')
export class ServiceOfferingController {
  constructor(private serviceOfferingService: ServiceOfferingService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CORE_ORG_UPDATE)
  @ApiOperation({ summary: 'Create service offering' })
  @ApiResponse({ status: 201, description: 'Service offering created' })
  async create(
    @Body() createDto: CreateServiceOfferingDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.serviceOfferingService.create(organizationId, createDto);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.CORE_ORG_READ)
  @ApiOperation({ summary: 'Get all service offerings' })
  @ApiResponse({ status: 200, description: 'Service offerings retrieved' })
  async findAll(
    @Query() query: PaginationDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.serviceOfferingService.findAll(organizationId, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CORE_ORG_READ)
  @ApiOperation({ summary: 'Get service offering by ID' })
  @ApiResponse({ status: 200, description: 'Service offering retrieved' })
  async findOne(@Param('id') id: string) {
    return this.serviceOfferingService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.CORE_ORG_UPDATE)
  @ApiOperation({ summary: 'Update service offering' })
  @ApiResponse({ status: 200, description: 'Service offering updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateServiceOfferingDto,
  ) {
    return this.serviceOfferingService.update(id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CORE_ORG_UPDATE)
  @ApiOperation({ summary: 'Deactivate service offering' })
  @ApiResponse({ status: 200, description: 'Service offering deactivated' })
  async remove(@Param('id') id: string) {
    return this.serviceOfferingService.remove(id);
  }
}
