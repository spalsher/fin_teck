import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { PaymentProvider } from '../adapters/payment-provider.interface';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { Public } from '../../../shared/decorators/public.decorator';

class CreatePaymentIntentDto {
  invoiceId: string;
  provider: PaymentProvider;
}

@ApiTags('integration/payment')
@Controller('integration/payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('intent')
  @ApiBearerAuth()
  @RequirePermissions('integration:payment:create')
  @ApiOperation({ summary: 'Create payment intent for invoice' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  async createPaymentIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser('branchId') branchId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentService.createPaymentIntent(
      branchId,
      dto.invoiceId,
      dto.provider,
      userId,
    );
  }

  @Get('intent/:id')
  @ApiBearerAuth()
  @RequirePermissions('integration:payment:read')
  @ApiOperation({ summary: 'Get payment intent by ID' })
  @ApiParam({ name: 'id', description: 'Payment intent ID' })
  @ApiResponse({ status: 200, description: 'Payment intent details' })
  async getPaymentIntent(@Param('id') id: string) {
    return this.paymentService.getPaymentIntent(id);
  }

  @Get('invoice/:invoiceId/intents')
  @ApiBearerAuth()
  @RequirePermissions('integration:payment:read')
  @ApiOperation({ summary: 'Get payment intents for invoice' })
  @ApiParam({ name: 'invoiceId', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'List of payment intents' })
  async getInvoicePaymentIntents(@Param('invoiceId') invoiceId: string) {
    return this.paymentService.getInvoicePaymentIntents(invoiceId);
  }

  @Post('intent/:id/cancel')
  @ApiBearerAuth()
  @RequirePermissions('integration:payment:cancel')
  @ApiOperation({ summary: 'Cancel payment intent' })
  @ApiParam({ name: 'id', description: 'Payment intent ID' })
  @ApiResponse({ status: 200, description: 'Payment intent cancelled' })
  async cancelPaymentIntent(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.paymentService.cancelPaymentIntent(id, userId);
  }

  @Post('webhook/:provider')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Webhook endpoint for payment providers' })
  @ApiParam({ name: 'provider', enum: PaymentProvider, description: 'Payment provider name' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Param('provider') provider: string,
    @Body() payload: any,
    @Headers('x-signature') signature?: string,
  ) {
    return this.paymentService.processWebhook(
      provider as PaymentProvider,
      payload,
      signature,
    );
  }

  @Get('history')
  @ApiBearerAuth()
  @RequirePermissions('integration:payment:read')
  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({ status: 200, description: 'Payment history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'provider', required: false, type: String })
  async getPaymentHistory(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('status') status?: string,
    @Query('provider') provider?: string,
  ) {
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);

    return this.paymentService.getPaymentHistory({
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      status,
      provider,
    });
  }

  @Post('simulate/:intentId/complete')
  @ApiBearerAuth()
  @RequirePermissions('integration:payment:simulate')
  @ApiOperation({ summary: 'Simulate payment completion (testing only)' })
  @ApiParam({ name: 'intentId', description: 'Payment intent ID' })
  @ApiResponse({ status: 200, description: 'Payment simulated' })
  async simulatePaymentCompletion(@Param('intentId') intentId: string) {
    // This is for testing only - simulate a webhook callback
    const intent = await this.paymentService.getPaymentIntent(intentId);
    
    await this.paymentService.processWebhook(
      intent.provider as PaymentProvider,
      {
        paymentIntentId: intentId,
        transactionId: `TXN-SIM-${Date.now()}`,
        status: 'COMPLETED',
        amount: intent.amount,
        currency: intent.currency,
        paidAt: new Date(),
      },
    );

    return { message: 'Payment completion simulated successfully' };
  }
}
