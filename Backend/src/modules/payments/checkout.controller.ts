import { BadRequestException, Body, Controller, Post, Req, UseGuards, UsePipes } from '@nestjs/common';
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
import { toApiOrder } from '../orders/order.mapper';
import { UsersService } from '../users/users.service';
import { CoursesService } from '../courses/courses.service';
import { PromoCodesService } from '../promo-codes/promo-codes.service';
import { PaypalCaptureService } from './paypal-capture.service';
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
    private readonly courses: CoursesService,
    private readonly promoCodes: PromoCodesService,
    private readonly paypalCapture: PaypalCaptureService,
  ) {}

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
    const order = await this.orders.createPending({
      studentName: dbUser?.name ?? 'Student',
      studentEmail: dbUser?.email ?? jwtUser.email,
      studentPhone: dbUser?.phone,
      courseTitle: body.courseTitle,
      currency: body.currency ?? 'usd',
      amount: body.amount,
      discountAmount: body.discountAmount,
      promoCode: body.promoCode,
      provider: isBank ? 'manual' : 'stripe',
      paymentMethod: isBank ? 'cash' : 'card',
      userId: jwtUser.sub,
      courseIds: body.courseIds?.length ? body.courseIds : undefined,
      bankTransferProofUrl: body.bankTransferProofUrl,
    });

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
      throw new Error('Order not found');
    }
    if (body.transactionId && order.provider !== 'manual') {
      await this.paypalCapture.captureOrder(body.transactionId);
    }
    const updated = await this.orders.updateStatus({
      orderId: body.orderId,
      status: body.status ?? 'paid',
      transactionId: body.transactionId,
    });
    if (!updated) {
      throw new Error('Order not found');
    }
    if (updated.status === 'paid' && updated.promoCode?.trim()) {
      await this.promoCodes.incrementUsageByCode(updated.promoCode.trim());
    }
    if (
      updated.status === 'paid' &&
      updated.userId &&
      updated.courseIds?.length
    ) {
      for (const courseId of updated.courseIds) {
        const newlyAdded = await this.users.addEnrolledCourse(
          updated.userId,
          courseId,
        );
        if (newlyAdded) {
          await this.courses.incrementEnrolledCount(courseId, 1);
        }
      }
    }
    return { ok: true, order: toApiOrder(updated) };
  }
}
