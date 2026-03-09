import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymobService } from './paymob.service';

@ApiTags('payments')
@Controller('payment')
export class PaymobController {
  constructor(private readonly paymobService: PaymobService) {}

  @Post('paymob/callback')
  @ApiOperation({
    summary: 'Paymob webhook',
    description:
      'Server-to-server callback. Configure this URL in Paymob dashboard as Notification URL. HMAC is verified. On success, order is marked paid and user is enrolled in courses.',
  })
  @ApiResponse({ status: 200, description: 'Callback processed' })
  @ApiResponse({ status: 400, description: 'Invalid HMAC or body' })
  handleCallback(@Body() body: Record<string, unknown>) {
    return this.paymobService.handleCallback(body);
  }
}
