import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaxCategoryService } from '../services/tax-category.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('tax-categories')
export class TaxCategoryController {
  constructor(private service: TaxCategoryService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_CREATE)
  @ApiOperation({ summary: 'Create tax category' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @Body() body: { code: string; name: string; description?: string; isActive?: boolean },
  ) {
    return this.service.create(organizationId, body);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_READ)
  @ApiOperation({ summary: 'List tax categories' })
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(organizationId, {
      skip: page && pageSize ? (parseInt(page, 10) - 1) * parseInt(pageSize, 10) : undefined,
      take: pageSize ? parseInt(pageSize, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_READ)
  @ApiOperation({ summary: 'Get tax category by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_UPDATE)
  @ApiOperation({ summary: 'Update tax category' })
  update(@Param('id') id: string, @Body() body: { name?: string; description?: string; isActive?: boolean }) {
    return this.service.update(id, body);
  }

  @Post(':id/rates')
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_UPDATE)
  @ApiOperation({ summary: 'Add tax rate to category' })
  addRate(
    @Param('id') id: string,
    @Body() body: { rate: number; effectiveFrom: string; effectiveTo?: string; description?: string },
  ) {
    return this.service.addRate(id, {
      rate: body.rate,
      effectiveFrom: new Date(body.effectiveFrom),
      effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : undefined,
      description: body.description,
    });
  }
}
