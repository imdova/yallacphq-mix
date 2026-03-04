import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  Version,
} from '@nestjs/common';
import { Role } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  createPromoCodeBodySchema,
  listPromoCodesResponseSchema,
  promoCodeResponseSchema,
  validatePromoCodeBodySchema,
  validatePromoCodeResponseSchema,
} from '../../contracts';
import type {
  CreatePromoCodeBody,
  ValidatePromoCodeBody,
} from '../../contracts';
import {
  CreatePromoCodeBodyDto,
  ListPromoCodesResponseDto,
  PromoCodeResponseDto,
} from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PromoCodesService } from './promo-codes.service';
import { toApiPromo } from './promo.mapper';
import { CoursesService } from '../courses/courses.service';

@ApiTags('promo-codes')
@Controller('promo-codes')
export class PromoCodesController {
  constructor(
    private readonly promo: PromoCodesService,
    private readonly courses: CoursesService,
  ) {}

  @Get()
  @Version('1')
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listPromoCodesResponseSchema)
  @ApiOperation({ summary: 'List promo codes (admin)' })
  @ApiAuth()
  @ApiOkResponse({ type: ListPromoCodesResponseDto })
  async list() {
    const items = await this.promo.list();
    return { items: items.map(toApiPromo) };
  }

  @Post()
  @Version('1')
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(createPromoCodeBodySchema))
  @ResponseSchema(promoCodeResponseSchema)
  @ApiOperation({ summary: 'Create promo code (admin)' })
  @ApiAuth()
  @ApiBody({ type: CreatePromoCodeBodyDto })
  @ApiCreatedResponse({ type: PromoCodeResponseDto })
  async create(@Body() body: CreatePromoCodeBody) {
    const created = await this.promo.create(body);
    return { promo: toApiPromo(created) };
  }

  @Post('validate')
  @Version('1')
  @UsePipes(new ZodValidationPipe(validatePromoCodeBodySchema))
  @ResponseSchema(validatePromoCodeResponseSchema)
  @ApiOperation({ summary: 'Validate promo code (contract route)' })
  @ApiOkResponse({
    schema: {
      example: {
        ok: true,
        promo: {
          id: '...',
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          active: true,
          maxUsageEnabled: false,
          maxUsage: null,
          perCustomerLimitEnabled: false,
          perCustomerLimit: null,
          restrictToProductEnabled: false,
          productId: null,
          usageCount: 0,
        },
        discountAmount: 29.9,
        discountedTotal: 269.1,
      },
    },
  })
  async validate(@Body() body: ValidatePromoCodeBody) {
    const promo = await this.promo.findActiveByCode(body.code);
    if (!promo)
      throw new BadRequestException({
        message: 'Invalid promo code',
        code: 'INVALID_PROMO',
      });

    if (
      promo.restrictToProductEnabled &&
      promo.productId &&
      promo.productId !== body.courseId
    ) {
      throw new BadRequestException({
        message: 'Promo code not valid for this course',
        code: 'PROMO_NOT_APPLICABLE',
      });
    }

    const course = await this.courses.findById(body.courseId);
    const base = (course?.priceSale ?? course?.priceRegular ?? 0) || 0;

    const discount =
      promo.discountType === 'percentage'
        ? Math.max(0, (base * promo.discountValue) / 100)
        : Math.max(0, promo.discountValue);

    const discountAmount = Math.min(base, discount);
    const discountedTotal = Math.max(0, base - discountAmount);

    return {
      ok: true,
      promo: toApiPromo(promo),
      discountAmount,
      discountedTotal,
    };
  }
}
