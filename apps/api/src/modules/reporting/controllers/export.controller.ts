import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from '../services/export.service';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { PERMISSIONS } from '@iteck/shared';

class ExportRequestDto {
  entity: string;
  filters?: any;
  columns?: string[];
  format: 'csv' | 'json';
}

@ApiTags('reporting')
@ApiBearerAuth()
@Controller('export')
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Post('csv')
  @RequirePermissions(PERMISSIONS.REPORT_EXPORT_READ)
  @ApiOperation({ summary: 'Export data to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file generated' })
  async exportCSV(@Body() exportDto: ExportRequestDto, @Res() res: Response) {
    try {
      const csv = await this.exportService.exportToCSV({
        entity: exportDto.entity,
        filters: exportDto.filters,
        columns: exportDto.columns,
      });

      const filename = `${exportDto.entity}_${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HttpStatus.OK).send(csv);
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Export failed',
      });
    }
  }

  @Post('json')
  @RequirePermissions(PERMISSIONS.REPORT_EXPORT_READ)
  @ApiOperation({ summary: 'Export data to JSON' })
  @ApiResponse({ status: 200, description: 'JSON data generated' })
  async exportJSON(@Body() exportDto: ExportRequestDto, @Res() res: Response) {
    try {
      const data = await this.exportService.exportToJSON({
        entity: exportDto.entity,
        filters: exportDto.filters,
        columns: exportDto.columns,
      });

      const filename = `${exportDto.entity}_${new Date().toISOString().split('T')[0]}.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Export failed',
      });
    }
  }

  @Post()
  @RequirePermissions(PERMISSIONS.REPORT_EXPORT_READ)
  @ApiOperation({ summary: 'Export data in specified format' })
  @ApiResponse({ status: 200, description: 'File generated' })
  async export(@Body() exportDto: ExportRequestDto, @Res() res: Response) {
    if (exportDto.format === 'csv') {
      return this.exportCSV(exportDto, res);
    } else if (exportDto.format === 'json') {
      return this.exportJSON(exportDto, res);
    } else {
      res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid format. Supported formats: csv, json',
      });
    }
  }
}
