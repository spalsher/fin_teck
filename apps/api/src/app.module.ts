import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { CoreModule } from './modules/core/core.module';
import { FinanceModule } from './modules/finance/finance.module';
import { ScmModule } from './modules/scm/scm.module';
import { AssetModule } from './modules/asset/asset.module';
import { HrmsModule } from './modules/hrms/hrms.module';
import { ManufacturingModule } from './modules/manufacturing/manufacturing.module';
// import { IntegrationModule } from './modules/integration/integration.module';
import { ReportingModule } from './modules/reporting/reporting.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      },
    ]),

    // Shared infrastructure
    SharedModule,

    // Domain modules
    AuthModule,
    CoreModule,
    FinanceModule,
    ScmModule,
    AssetModule,
    HrmsModule,
    ManufacturingModule,
    // IntegrationModule, // TODO: Fix schema alignment issues
    ReportingModule,
  ],
})
export class AppModule {}
