import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
import type { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
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
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { OrdersService } from '../orders/orders.service';
import { OrderCompletionService } from '../orders/order-completion.service';
import { toApiOrder } from '../orders/order.mapper';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PaypalCaptureService } from './paypal-capture.service';
import { PaymobService } from './paymob.service';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
    private readonly mail: MailService,
    private readonly paypalCapture: PaypalCaptureService,
    private readonly paymobService: PaymobService,
  ) {}

  private buildGuestPath(pathname: string, params: Record<string, string | undefined>) {
    const url = new URL(this.mail.getAppUrl(pathname));
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, value);
      }
    }
    return `${url.pathname}${url.search}`;
  }

  private getPostCheckoutNextPath(params: {
    accountAction: 'dashboard' | 'login' | 'set-password';
    email: string;
    paid: boolean;
  }) {
    const next = params.paid ? '/dashboard/courses' : '/dashboard/orders';
    switch (params.accountAction) {
      case 'set-password':
        return this.buildGuestPath('/set-password', {
          email: params.email,
          auto: '1',
          next,
        });
      case 'login':
        return this.buildGuestPath('/auth/login', {
          email: params.email,
          next,
        });
      default:
        return next;
    }
  }

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
  @UseGuards(OptionalJwtAuthGuard)
  @ResponseSchema(createPaymentSessionResponseSchema)
  @ApiOperation({ summary: 'Create payment session (guest or authenticated)' })
  @ApiBody({ type: CreatePaymentSessionBodyDto })
  @ApiCreatedResponse({ type: CreatePaymentSessionResponseDto })
  async createSession(
    @Req() req: Request,
    @CurrentUser() jwtUser: RequestUser | null,
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
    const dbUser = jwtUser ? await this.users.findById(jwtUser.sub) : null;
    const isBank = body.method === 'bank';
    const isPaymob = body.method === 'paymob';
    const requestedEmail = body.studentEmail?.trim().toLowerCase();
    const billingEmail = body.billingData?.email?.trim().toLowerCase();

    if (
      requestedEmail &&
      billingEmail &&
      requestedEmail !== billingEmail
    ) {
      throw new BadRequestException(
        'studentEmail must match billingData.email when both are provided.',
      );
    }

    const studentEmail =
      requestedEmail ||
      billingEmail ||
      dbUser?.email?.trim().toLowerCase() ||
      jwtUser?.email?.trim().toLowerCase();
    const studentName =
      body.studentName?.trim() ||
      [body.billingData?.first_name, body.billingData?.last_name]
        .filter(Boolean)
        .join(' ')
        .trim() ||
      dbUser?.name?.trim() ||
      'Student';
    const studentPhone =
      body.studentPhone?.trim() ||
      body.billingData?.phone_number?.trim() ||
      dbUser?.phone?.trim();

    if (!studentEmail) {
      throw new BadRequestException(
        'studentEmail is required for guest checkout.',
      );
    }

    let linkedUser =
      (dbUser && dbUser.email.trim().toLowerCase() === studentEmail
        ? dbUser
        : null) ?? (await this.users.findByEmail(studentEmail));

    let accountAction: 'dashboard' | 'login' | 'set-password' = 'dashboard';
    if (!linkedUser) {
      const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
      linkedUser = await this.users.createStudent({
        name: studentName,
        email: studentEmail,
        passwordHash,
      });
      if (studentPhone) {
        linkedUser = (await this.users.updateById(linkedUser.id, {
          phone: studentPhone,
        })) ?? linkedUser;
      }
      accountAction = 'set-password';
    } else if (!jwtUser || linkedUser.id !== jwtUser.sub) {
      accountAction = 'login';
    }

    const postCheckoutNextPath = this.getPostCheckoutNextPath({
      accountAction,
      email: studentEmail,
      paid: !isBank,
    });

    const order = await this.orders.createPending({
      studentName,
      studentEmail,
      studentPhone,
      courseTitle: body.courseTitle,
      currency: body.currency ?? 'usd',
      amount: body.amount,
      discountAmount: body.discountAmount,
      promoCode: body.promoCode,
      provider: isBank ? 'manual' : isPaymob ? 'paymob' : 'stripe',
      paymentMethod:
        isBank
          ? 'cash'
          : body.paymobIntegrationType === 'ewallet'
            ? 'wallet'
            : 'card',
      userId: linkedUser.id,
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
          this.mail.getAppUrl(postCheckoutNextPath),
        );
      return {
        sessionId: order.id,
        provider: order.provider,
        order: toApiOrder(order),
        paymobRedirectUrl: unifiedCheckoutUrl,
        postCheckoutNextPath,
      };
    }

    return {
      sessionId: order.id,
      provider: order.provider,
      order: toApiOrder(order),
      postCheckoutNextPath,
    };
  }

  @Post('confirm')
  @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ZodValidationPipe(confirmPaymentBodySchema))
  @ResponseSchema(confirmPaymentResponseSchema)
  @ApiOperation({ summary: 'Confirm payment (guest or authenticated)' })
  @ApiBody({ type: ConfirmPaymentBodyDto })
  @ApiOkResponse({ type: ConfirmPaymentResponseDto })
  async confirm(
    @Body() body: ConfirmPaymentBody,
    @CurrentUser() jwtUser: RequestUser | null,
  ) {
    const order = await this.orders.findById(body.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Order cannot be confirmed from status "${order.status}".`,
      );
    }
    const isOwner = !!jwtUser && order.userId === jwtUser.sub;
    const isExternallyVerified =
      Boolean(body.transactionId) || order.provider === 'paymob';
    if (!isOwner && !isExternallyVerified) {
      throw new BadRequestException(
        'Login is required to confirm this payment.',
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
