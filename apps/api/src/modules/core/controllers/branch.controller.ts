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
import { BranchService } from '../services/branch.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS, PaginationDto } from '@iteck/shared';
import { CreateBranchDto, UpdateBranchDto } from '@iteck/shared';

@ApiTags('core')
@ApiBearerAuth()
@Controller('branches')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.CORE_BRANCH_CREATE)
  @ApiOperation({ summary: 'Create branch' })
  @ApiResponse({ status: 201, description: 'Branch created' })
  async create(
    @Body() createDto: CreateBranchDto,
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.branchService.create(organizationId, createDto, userId);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.CORE_BRANCH_READ)
  @ApiOperation({ summary: 'Get all branches' })
  @ApiResponse({ status: 200, description: 'Branches retrieved' })
  async findAll(
    @Query() query: PaginationDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.branchService.findAll(organizationId, query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CORE_BRANCH_READ)
  @ApiOperation({ summary: 'Get branch by ID' })
  @ApiResponse({ status: 200, description: 'Branch retrieved' })
  async findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.CORE_BRANCH_UPDATE)
  @ApiOperation({ summary: 'Update branch' })
  @ApiResponse({ status: 200, description: 'Branch updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBranchDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.branchService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CORE_BRANCH_DELETE)
  @ApiOperation({ summary: 'Deactivate branch' })
  @ApiResponse({ status: 200, description: 'Branch deactivated' })
  async remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}
