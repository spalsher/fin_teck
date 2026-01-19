import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { DashboardService } from './services/dashboard.service';
import { ExportService } from './services/export.service';
import { DashboardController } from './controllers/dashboard.controller';
import { ExportController } from './controllers/export.controller';

@Module({
  imports: [SharedModule],
  controllers: [DashboardController, ExportController],
  providers: [DashboardService, ExportService],
  exports: [DashboardService, ExportService],
})
export class ReportingModule {}
