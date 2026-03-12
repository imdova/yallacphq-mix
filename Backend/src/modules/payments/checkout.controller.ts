import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  confirmPaymentBodySchema,
  confirmPaymentResponseSchema,
  createPaymentSessionBodySchema,
  createPaymentSessionResponseSchema,
} from '../../contracts';
import type {
  ConfirmPaymentBody,
  CreatePaymentSessionBody,
} from '../../contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from '../orders/orders.service';
import { OrderCompletionService } from '../orders/order-completion.service';
import { toApiOrder } from '../orders/order.mapper';
import { UsersService } from '../users/users.service';
import { PaypalCaptureService } from './paypal-capture.service';
import { PaymobService } from './paymob.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import {
  ConfirmPaymentBodyDto,
  ConfirmPaymentResponseDto,
  CreatePaymentSessionBodyDto,
  CreatePaymentSessionResponseDto,
} from '../../contracts/dtos';

@ApiTags('payments')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly orders: OrdersService,
    private readonly users: UsersService,
    private readonly orderCompletion: OrderCompletionService,
    private readonly paypalCapture: PaypalCaptureService,
    private readonly paymobService: PaymobService,
  ) {}

  @Get('paymob-methods')
  @ApiOperation({ summary: 'List available Paymob integration types' })
  @ApiOkResponse({
    description: 'List of Paymob methods (card, ewallet, kiosk) that are configured',
    schema: {
      type: 'array',
      items: { type: 'object', properties: { type: { type: 'string', enum: ['card', 'ewallet', 'kiosk'] }, label: { type: 'string' } } },
    },
  })
  getPaymobMethods(): Array<{ type: string; label: string }> {
    if (!this.paymobService.isConfigured()) {
      return [];
    }
    return this.paymobService.getAvailablePaymobMethods();
  }

  @Post('session')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(createPaymentSessionResponseSchema)
  @ApiOperation({ summary: 'Create payment session' })
  @ApiAuth()
  @ApiBody({ type: CreatePaymentSessionBodyDto })
  @ApiCreatedResponse({ type: CreatePaymentSessionResponseDto })
  async createSession(
    @Req() req: Request,
    @CurrentUser() jwtUser: RequestUser,
  ) {
    let rawBody: unknown = req.body;
    if (typeof rawBody === 'string') {
      try {
        rawBody = rawBody.trim() ? (JSON.parse(rawBody) as unknown) : {};
      } catch {
        rawBody = {};
      }
    }
    if (typeof rawBody !== 'object' || rawBody === null) {
      rawBody = {};
    }
    const parsed = createPaymentSessionBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      });
    }
    const body: CreatePaymentSessionBody = parsed.data;

    const dbUser = await this.users.findById(jwtUser.sub);
    const isBank = body.method === 'bank';
    const isPaymob = body.method === 'paymob';
    const order = await this.orders.createPending({
      studentName: dbUser?.name ?? 'Student',
      studentEmail: dbUser?.email ?? jwtUser.email,
      studentPhone: dbUser?.phone,
      courseTitle: body.courseTitle,
      currency: body.currency ?? 'usd',
      amount: body.amount,
      discountAmount: body.discountAmount,
      promoCode: body.promoCode,
      provider: isBank ? 'manual' : isPaymob ? 'paymob' : 'stripe',
      paymentMethod: isBank ? 'cash' : 'card',
      userId: jwtUser.sub,
      courseIds: body.courseIds?.length ? body.courseIds : undefined,
      bankTransferProofUrl: body.bankTransferProofUrl,
    });

    if (isPaymob) {
      if (!this.paymobService.isConfigured()) {
        throw new BadRequestException(
          'Paymob is not configured. Set PAYMOB_SECRET_KEY, PAYMOB_HMAC_SECRET, PAYMOB_PUBLIC_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_CALLBACK_URL in Backend .env.',
        );
      }
      if (!body.billingData) {
        throw new BadRequestException(
          'billingData is required when method is paymob',
        );
      }
      const { unifiedCheckoutUrl } =
        await this.paymobService.createIntention(
          order.id,
          order.amount,
          order.currency,
          order.courseTitle,
          {
            first_name: body.billingData.first_name,
            last_name: body.billingData.last_name,
            email: body.billingData.email,
            phone_number: body.billingData.phone_number,
            city: body.billingData.city ?? 'Cairo',
            country: body.billingData.country ?? 'EGY',
          },
          body.paymobIntegrationType,
        );
      return {
        sessionId: order.id,
        provider: order.provider,
        order: toApiOrder(order),
        paymobRedirectUrl: unifiedCheckoutUrl,
      };
    }

    return {
      sessionId: order.id,
      provider: order.provider,
      order: toApiOrder(order),
    };
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(confirmPaymentBodySchema))
  @ResponseSchema(confirmPaymentResponseSchema)
  @ApiOperation({ summary: 'Confirm payment' })
  @ApiAuth()
  @ApiBody({ type: ConfirmPaymentBodyDto })
  @ApiOkResponse({ type: ConfirmPaymentResponseDto })
  async confirm(@Body() body: ConfirmPaymentBody) {
    const order = await this.orders.findById(body.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Order cannot be confirmed from status "${order.status}".`,
      );
    }
    if (body.transactionId && order.provider !== 'manual' && order.provider !== 'paymob') {
      try {
        await this.paypalCapture.captureOrder(body.transactionId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'PayPal capture failed';
        throw new BadRequestException(
          message.startsWith('PAYPAL_')
            ? 'PayPal is not configured. Please use bank transfer.'
            : 'PayPal payment failed. Please try again or choose bank transfer.',
        );
      }
    }
    const updated = await this.orders.updateStatus({
      orderId: body.orderId,
      status: body.status ?? 'paid',
      transactionId: body.transactionId,
    });
    if (!updated) {
      throw new NotFoundException('Order not found');
    }

    if (updated.status === 'paid') {
      await this.orderCompletion.handlePaidOrder(updated, {
        providerLabel:
          updated.provider === 'paymob'
            ? 'Paymob'
            : body.transactionId
              ? 'PayPal'
              : 'Card Payment',
      });
    }
    return { ok: true, order: toApiOrder(updated) };
  }
}
