export const PAYMENTS_PROVIDER = 'PAYMENTS_PROVIDER';

export type CreateCheckoutParams = {
  orderId: string;
  amountCents: number;
  currency: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
};

export type CreateCheckoutResult = {
  provider: string;
  checkoutUrl?: string;
  providerReference?: string;
};

export interface PaymentProvider {
  createCheckout(params: CreateCheckoutParams): Promise<CreateCheckoutResult>;
  verifyAndParseWebhook(
    rawBody: Buffer,
    signatureHeader?: string,
  ): Promise<unknown>;
}
