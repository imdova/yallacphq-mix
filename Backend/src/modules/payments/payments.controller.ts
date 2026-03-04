import { Controller, Headers, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { SkipResponseWrap } from '../../common/decorators/skip-response-wrap.decorator';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('webhook')
  @SkipResponseWrap()
  @ApiOperation({ summary: 'Payment webhook (external)' })
  @ApiSecurity('externalApiKey')
  @ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'External service API key',
  })
  @ApiHeader({
    name: 'stripe-signature',
    required: false,
    description: 'Stripe webhook signature header (when using Stripe)',
  })
  async webhook(
    @Req() req: Request & { rawBody?: Buffer; body?: unknown },
    @Headers('stripe-signature') signature?: string,
  ) {
    const rawBody =
      req.rawBody ??
      (Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(JSON.stringify(req.body ?? {})));
    return this.payments.handleWebhook(rawBody, signature);
  }
}
