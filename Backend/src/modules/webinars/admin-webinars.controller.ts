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
  Version,
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
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import {
  adminDeleteWebinarResponseSchema,
  createWebinarBodySchema,
  listWebinarsResponseSchema,
  updateWebinarBodySchema,
  webinarNullableResponseSchema,
  webinarResponseSchema,
} from '../../contracts';
import type { CreateWebinarBody, UpdateWebinarBody } from '../../contracts';
import {
  ApiOkDto,
  CreateWebinarBodyDto,
  ListWebinarsResponseDto,
  UpdateWebinarBodyDto,
  WebinarNullableResponseDto,
  WebinarResponseDto,
} from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiWebinar } from './webinar.mapper';
import { WebinarsService } from './webinars.service';

@ApiTags('admin', 'webinars')
@Controller('admin/webinars')
export class AdminWebinarsController {
  constructor(private readonly webinars: WebinarsService) {}

  @Get()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listWebinarsResponseSchema)
  @ApiOperation({ summary: 'Admin: list webinars' })
  @ApiAuth()
  @ApiOkResponse({ type: ListWebinarsResponseDto })
  async list() {
    const items = await this.webinars.listAll();
    return { items: items.map(toApiWebinar) };
  }

  @Post()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(webinarResponseSchema)
  @ApiOperation({ summary: 'Admin: create webinar' })
  @ApiAuth()
  @ApiBody({ type: CreateWebinarBodyDto })
  @ApiCreatedResponse({ type: WebinarResponseDto })
  async create(
    @Body(new ZodValidationPipe(createWebinarBodySchema))
    body: CreateWebinarBody,
  ) {
    const created = await this.webinars.create(body);
    return { webinar: toApiWebinar(created) };
  }

  @Get(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(webinarNullableResponseSchema)
  @ApiOperation({ summary: 'Admin: get webinar by id' })
  @ApiAuth()
  @ApiOkResponse({ type: WebinarNullableResponseDto })
  async getById(@Param('id') id: string) {
    const webinar = await this.webinars.findById(id);
    return { webinar: webinar ? toApiWebinar(webinar) : null };
  }

  @Patch(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(webinarResponseSchema)
  @ApiOperation({ summary: 'Admin: update webinar' })
  @ApiAuth()
  @ApiBody({ type: UpdateWebinarBodyDto })
  @ApiOkResponse({ type: WebinarResponseDto })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateWebinarBodySchema))
    body: UpdateWebinarBody,
  ) {
    const updated = await this.webinars.updateById(id, body);
    if (!updated) throw new NotFoundException('Webinar not found');
    return { webinar: toApiWebinar(updated) };
  }

  @Delete(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminDeleteWebinarResponseSchema)
  @ApiOperation({ summary: 'Admin: delete webinar' })
  @ApiAuth()
  @ApiOkResponse({ type: ApiOkDto })
  async remove(@Param('id') id: string) {
    const deleted = await this.webinars.deleteById(id);
    if (!deleted) throw new NotFoundException('Webinar not found');
    return { ok: true };
  }
}
