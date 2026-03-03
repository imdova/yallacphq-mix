import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ListOrdersResponseDto } from '../../contracts/dtos';
import {
  createOrderBodySchema,
  listOrdersResponseSchema,
  orderResponseSchema,
} from '../../contracts';
import type { CreateOrderBody } from '../../contracts';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { toApiOrder } from './order.mapper';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @Version(['1', VERSION_NEUTRAL])
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(listOrdersResponseSchema)
  @ApiOperation({ summary: 'List my orders (contract route)' })
  @ApiAuth()
  @ApiOkResponse({ type: ListOrdersResponseDto })
  async listMine(@CurrentUser() user: RequestUser) {
    const items = await this.orders.listForStudentEmail(user.email);
    return { items: items.map(toApiOrder) };
  }

  @Get('me')
  @Version(['1', VERSION_NEUTRAL])
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(listOrdersResponseSchema)
  @ApiOperation({ summary: 'List my orders (legacy alias)' })
  @ApiAuth()
  @ApiOkResponse({ type: ListOrdersResponseDto })
  async listMineAlias(@CurrentUser() user: RequestUser) {
    return this.listMine(user);
  }

  @Post()
  @Version(['1', VERSION_NEUTRAL])
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createOrderBodySchema))
  @ResponseSchema(orderResponseSchema)
  @ApiOperation({ summary: 'Create order (contract route)' })
  @ApiAuth()
  @ApiBody({
    schema: {
      example: {
        studentName: 'Jane Student',
        studentEmail: 'student@example.com',
        courseTitle: 'CPHQ Exam Prep 2026',
        amount: 299,
        currency: 'usd',
        provider: 'manual',
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        order: {
          id: '...',
          studentName: 'Jane Student',
          studentEmail: 'student@example.com',
          courseTitle: 'CPHQ Exam Prep 2026',
          currency: 'usd',
          amount: 299,
          provider: 'manual',
          status: 'pending',
          createdAt: '...',
          updatedAt: '...',
        },
      },
    },
  })
  async create(
    @Body() body: CreateOrderBody,
    @CurrentUser() user: RequestUser,
  ) {
    // keep contract shape, but ensure the order belongs to the authenticated user
    const created = await this.orders.createFromContract({
      ...body,
      studentEmail: user.email,
      studentName: body.studentName || 'Student',
    });
    return { order: toApiOrder(created) };
  }
}
