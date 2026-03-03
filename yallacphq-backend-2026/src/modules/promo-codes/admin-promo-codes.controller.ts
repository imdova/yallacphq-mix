import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
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
  adminDeletePromoCodeResponseSchema,
  createPromoCodeBodySchema,
  listPromoCodesResponseSchema,
  promoCodeNullableResponseSchema,
  promoCodeResponseSchema,
  updatePromoCodeBodySchema,
} from '../../contracts';
import type { CreatePromoCodeBody, UpdatePromoCodeBody } from '../../contracts';
import {
  ApiOkDto,
  CreatePromoCodeBodyDto,
  ListPromoCodesResponseDto,
  PromoCodeResponseDto,
} from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiPromo } from './promo.mapper';
import { PromoCodesService } from './promo-codes.service';

@ApiTags('admin')
@Controller('admin/promo-codes')
export class AdminPromoCodesController {
  constructor(private readonly promo: PromoCodesService) {}

  @Get()
  @Version(['1', VERSION_NEUTRAL])
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listPromoCodesResponseSchema)
  @ApiOperation({ summary: 'Admin: list promo codes' })
  @ApiAuth()
  @ApiOkResponse({ type: ListPromoCodesResponseDto })
  async list() {
    const items = await this.promo.list();
    return { items: items.map(toApiPromo) };
  }

  @Post()
  @Version(['1', VERSION_NEUTRAL])
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(createPromoCodeBodySchema))
  @ResponseSchema(promoCodeResponseSchema)
  @ApiOperation({ summary: 'Admin: create promo code' })
  @ApiAuth()
  @ApiBody({ type: CreatePromoCodeBodyDto })
  @ApiCreatedResponse({ type: PromoCodeResponseDto })
  async create(@Body() body: CreatePromoCodeBody) {
    const created = await this.promo.create(body);
    return { promo: toApiPromo(created) };
  }

  @Get(':id')
  @Version(['1', VERSION_NEUTRAL])
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(promoCodeNullableResponseSchema)
  @ApiOperation({ summary: 'Admin: get promo code by id' })
  @ApiAuth()
  async getById(@Param('id') id: string) {
    const promo = await this.promo.findById(id);
    return { promo: promo ? toApiPromo(promo) : null };
  }

  @Patch(':id')
  @Version(['1', VERSION_NEUTRAL])
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(updatePromoCodeBodySchema))
  @ResponseSchema(promoCodeResponseSchema)
  @ApiOperation({ summary: 'Admin: update promo code' })
  @ApiAuth()
  async update(@Param('id') id: string, @Body() body: UpdatePromoCodeBody) {
    const updated = await this.promo.updateById(id, body);
    if (!updated) throw new NotFoundException('Promo code not found');
    return { promo: toApiPromo(updated) };
  }

  @Delete(':id')
  @Version(['1', VERSION_NEUTRAL])
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminDeletePromoCodeResponseSchema)
  @ApiOperation({ summary: 'Admin: delete promo code' })
  @ApiAuth()
  @ApiOkResponse({ type: ApiOkDto })
  async remove(@Param('id') id: string) {
    const deleted = await this.promo.deleteById(id);
    if (!deleted) throw new NotFoundException('Promo code not found');
    return { ok: true };
  }
}
