import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import { cartResponseSchema } from '../../contracts/cart';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(cartResponseSchema)
  @ApiOperation({ summary: 'Get current user cart' })
  @ApiAuth()
  @ApiOkResponse({ description: 'Cart with course IDs' })
  async getCart(@CurrentUser() user: RequestUser) {
    const courseIds = await this.cart.getCart(user.sub);
    return { courseIds };
  }

  @Post('items')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(cartResponseSchema)
  @ApiOperation({ summary: 'Add course to cart' })
  @ApiAuth()
  @ApiOkResponse({ description: 'Updated cart' })
  async addItem(@Req() req: Request, @CurrentUser() user: RequestUser) {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: [{ message: 'Body must be a JSON object', path: ['body'], code: 'invalid_type' }],
      });
    }
    const raw = (body as Record<string, unknown>).courseId;
    const courseId = typeof raw === 'string' ? raw.trim() : raw != null ? String(raw).trim() : '';
    if (!courseId) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: [{ message: 'courseId is required', path: ['courseId'], code: 'custom' }],
      });
    }
    const courseIds = await this.cart.addItem(user.sub, courseId);
    return { courseIds };
  }

  @Delete('items/:courseId')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(cartResponseSchema)
  @ApiOperation({ summary: 'Remove course from cart' })
  @ApiAuth()
  @ApiOkResponse({ description: 'Updated cart' })
  async removeItem(
    @Param('courseId') courseId: string,
    @CurrentUser() user: RequestUser,
  ) {
    const courseIds = await this.cart.removeItem(user.sub, courseId);
    return { courseIds };
  }

  @Delete()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(cartResponseSchema)
  @ApiOperation({ summary: 'Clear cart' })
  @ApiAuth()
  @ApiOkResponse({ description: 'Empty cart' })
  async clearCart(@CurrentUser() user: RequestUser) {
    await this.cart.clearCart(user.sub);
    return { courseIds: [] };
  }
}
