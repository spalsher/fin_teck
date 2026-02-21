import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehicleBookingService } from '../services/vehicle-booking.service';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';

@ApiTags('finance')
@ApiBearerAuth()
@Controller('vehicle-bookings')
export class VehicleBookingController {
  constructor(private service: VehicleBookingService) {}

  @Post()
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_CREATE)
  @ApiOperation({ summary: 'Create vehicle booking' })
  create(
    @CurrentUser('organizationId') organizationId: string,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { vehicleRef: string; bookingDate: string; purpose?: string },
  ) {
    return this.service.create(organizationId, branchId ?? null, {
      vehicleRef: body.vehicleRef,
      bookingDate: new Date(body.bookingDate),
      purpose: body.purpose,
    }, userId);
  }

  @Get()
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_READ)
  @ApiOperation({ summary: 'List vehicle bookings' })
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('branchId') branchId?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.service.findAll(organizationId, {
      branchId,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
      skip: page && pageSize ? (parseInt(page, 10) - 1) * parseInt(pageSize, 10) : undefined,
      take: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_READ)
  @ApiOperation({ summary: 'Get vehicle booking by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id/status')
  @RequirePermissions(PERMISSIONS.FINANCE_GL_ACCOUNT_UPDATE)
  @ApiOperation({ summary: 'Update booking status' })
  updateStatus(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status, userId);
  }
}
