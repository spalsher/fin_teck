import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { FinanceModule } from '../finance/finance.module';

// Adapters
import { MockCrmAdapter } from './adapters/mock-crm.adapter';
import { MockPaymentProviderAdapter } from './adapters/mock-payment-provider.adapter';

// Services
import { AutomatedBillingService } from './services/automated-billing.service';
import { PaymentService } from './services/payment.service';

// Controllers
import { IntegrationController } from './controllers/integration.controller';
import { PaymentController } from './controllers/payment.controller';

export const CRM_ADAPTER_TOKEN = 'ICrmAdapter';

@Module({
  imports: [SharedModule, FinanceModule],
  controllers: [IntegrationController, PaymentController],
  providers: [
    {
      provide: CRM_ADAPTER_TOKEN,
      useClass: MockCrmAdapter,
    },
    MockCrmAdapter,
    AutomatedBillingService,
    PaymentService,
  ],
  exports: [AutomatedBillingService, PaymentService],
})
export class IntegrationModule {}
