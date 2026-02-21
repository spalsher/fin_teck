import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProformaInvoiceService } from '../services/proforma-invoice.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('proforma-invoices')
export class ProformaInvoiceController {
  constructor(private service: ProformaInvoiceService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_BILL_CREATE)
  @ApiOperation({ summary: 'Create proforma invoice' })
  create(
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { customerId?: string; vendorId?: string; piDate: string; totalAmount: number; notes?: string },
  ) {
    return this.service.create(branchId, {
      customerId: body.customerId,
      vendorId: body.vendorId,
      piDate: new Date(body.piDate),
      totalAmount: body.totalAmount,
      notes: body.notes,
    }, userId);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_BILL_READ)
  @ApiOperation({ summary: 'List proforma invoices' })
  findAll(
    @CurrentUser('branchId') branchId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(branchId, {
      skip: page && pageSize ? (parseInt(page, 10) - 1) * parseInt(pageSize, 10) : undefined,
      take: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_BILL_READ)
  @ApiOperation({ summary: 'Get proforma invoice by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/issuances')
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_UPDATE)
  @ApiOperation({ summary: 'Add issuance to proforma invoice' })
  addIssuance(@Param('id') id: string, @Body() body: { issuanceDate: string; notes?: string }) {
    return this.service.addIssuance(id, {
      issuanceDate: new Date(body.issuanceDate),
      notes: body.notes,
    });
  }
}
