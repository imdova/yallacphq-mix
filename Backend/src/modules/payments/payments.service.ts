import { Inject, Injectable, NotImplementedException } from '@nestjs/common';
import {
  CreateCheckoutParams,
  PaymentProvider,
  PAYMENTS_PROVIDER,
} from './payments.types';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PAYMENTS_PROVIDER)
    private readonly provider: PaymentProvider | null,
  ) {}

  async createCheckout(params: CreateCheckoutParams) {
    if (!this.provider) {
      throw new NotImplementedException('No payment provider configured');
    }
    return this.provider.createCheckout(params);
  }

  async handleWebhook(rawBody: Buffer, signature?: string) {
    if (!this.provider) {
      throw new NotImplementedException('No payment provider configured');
    }
    return this.provider.verifyAndParseWebhook(rawBody, signature);
  }
}
