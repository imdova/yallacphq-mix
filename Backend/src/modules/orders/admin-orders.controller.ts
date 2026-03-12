import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
  Version,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Role as AppRole } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  adminDeleteOrderResponseSchema,
  createOrderBodySchema,
  listOrdersResponseSchema,
  orderNullableResponseSchema,
  orderResponseSchema,
  updateOrderBodySchema,
} from '../../contracts';
import type { CreateOrderBody, UpdateOrderBody } from '../../contracts';
import { ApiOkDto, ListOrdersResponseDto } from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiOrder } from './order.mapper';
import { OrderCompletionService } from './order-completion.service';
import { OrdersService } from './orders.service';

@ApiTags('admin')
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(
    private readonly orders: OrdersService,
    private readonly orderCompletion: OrderCompletionService,
  ) {}

  @Get()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listOrdersResponseSchema)
  @ApiOperation({ summary: 'Admin: list orders' })
  @ApiAuth()
  @ApiOkResponse({ type: ListOrdersResponseDto })
  async list() {
    const items = await this.orders.listAll();
    return { items: items.map(toApiOrder) };
  }

  @Post()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(createOrderBodySchema))
  @ResponseSchema(orderResponseSchema)
  @ApiOperation({ summary: 'Admin: create order' })
  @ApiAuth()
  @ApiBody({
    schema: {
      example: {
        studentName: 'Jane',
        studentEmail: 'jane@example.com',
        courseTitle: 'CPHQ',
        amount: 299,
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        order: {
          id: '...',
          studentName: 'Jane',
          studentEmail: 'jane@example.com',
          courseTitle: 'CPHQ',
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
  async create(@Body() body: CreateOrderBody) {
    const created = await this.orders.createFromContract(body);
    return { order: toApiOrder(created) };
  }

  @Get(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(orderNullableResponseSchema)
  @ApiOperation({ summary: 'Admin: get order by id' })
  @ApiAuth()
  async getById(@Param('id') id: string) {
    const order = await this.orders.findById(id);
    return { order: order ? toApiOrder(order) : null };
  }

  @Patch(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(orderResponseSchema)
  @ApiOperation({ summary: 'Admin: update order' })
  @ApiAuth()
  async update(@Param('id') id: string, @Req() req: Request) {
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
    const parsed = updateOrderBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      });
    }
    const body: UpdateOrderBody = parsed.data;
    const existing = await this.orders.findById(id);
    if (!existing) throw new NotFoundException('Order not found');

    const patch: UpdateOrderBody = { ...body };
    if (body.status === 'paid') {
      (patch as Record<string, unknown>).paidAt = new Date().toISOString();
    }
    const updated = await this.orders.updateById(id, patch);
    if (!updated) throw new NotFoundException('Order not found');
    if (
      body.status === 'paid' &&
      existing.status !== 'paid' &&
      updated.status === 'paid'
    ) {
      await this.orderCompletion.handlePaidOrder(updated, {
        providerLabel: 'Bank Transfer',
      });
    }
    return { order: toApiOrder(updated) };
  }

  @Delete(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminDeleteOrderResponseSchema)
  @ApiOperation({ summary: 'Admin: delete order' })
  @ApiAuth()
  @ApiOkResponse({ type: ApiOkDto })
  async remove(@Param('id') id: string) {
    const deleted = await this.orders.deleteById(id);
    if (!deleted) throw new NotFoundException('Order not found');
    return { ok: true };
  }
}
