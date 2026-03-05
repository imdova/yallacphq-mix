import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
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
  ) {}

  @Post('session')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createPaymentSessionBodySchema))
  @ResponseSchema(createPaymentSessionResponseSchema)
  @ApiOperation({ summary: 'Create payment session' })
  @ApiAuth()
  @ApiBody({ type: CreatePaymentSessionBodyDto })
  @ApiCreatedResponse({ type: CreatePaymentSessionResponseDto })
  async createSession(
    @Body() body: CreatePaymentSessionBody,
    @CurrentUser() jwtUser: RequestUser,
  ) {
    const dbUser = await this.users.findById(jwtUser.sub);
    const order = await this.orders.createPending({
      studentName: dbUser?.name ?? 'Student',
      studentEmail: dbUser?.email ?? jwtUser.email,
      studentPhone: dbUser?.phone,
      courseTitle: body.courseTitle,
      currency: body.currency ?? 'usd',
      amount: body.amount,
      discountAmount: body.discountAmount,
      promoCode: body.promoCode,
      provider: 'stripe',
      userId: jwtUser.sub,
      courseIds: body.courseIds?.length ? body.courseIds : undefined,
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
    const updated = await this.orders.updateStatus({
      orderId: body.orderId,
      status: body.status ?? 'paid',
      transactionId: body.transactionId,
    });
    if (!updated) {
      throw new Error('Order not found');
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
