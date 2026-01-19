export enum PaymentProvider {
  ONE_LINK = '1LINK',
  JAZZCASH = 'JAZZCASH',
  EASYPAISA = 'EASYPAISA',
  HBL = 'HBL',
}

export enum PaymentIntentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  customerId: string;
  invoiceId?: string;
  description: string;
  status: PaymentIntentStatus;
  paymentUrl?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface PaymentWebhookData {
  provider: PaymentProvider;
  transactionId: string;
  paymentIntentId: string;
  status: PaymentIntentStatus;
  amount: number;
  currency: string;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export interface IPaymentProvider {
  /**
   * Get provider name
   */
  getProviderName(): PaymentProvider;

  /**
   * Create a payment intent/request
   */
  createPaymentIntent(params: {
    amount: number;
    currency: string;
    customerId: string;
    invoiceId?: string;
    description: string;
    callbackUrl: string;
    metadata?: Record<string, any>;
  }): Promise<PaymentIntent>;

  /**
   * Get payment intent status
   */
  getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent>;

  /**
   * Cancel a payment intent
   */
  cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean;

  /**
   * Parse webhook data
   */
  parseWebhookData(payload: any): PaymentWebhookData;
}
