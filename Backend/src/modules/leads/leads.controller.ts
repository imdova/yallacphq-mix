import {
  Body,
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
  leadCreateBodySchema,
  leadSubmitResponseSchema,
  webinarLeadCreateBodySchema,
} from '../../contracts';
import type { LeadCreateBody, WebinarLeadCreateBody } from '../../contracts';
import {
  LeadCreateBodyDto,
  LeadSubmitResponseDto,
} from '../../contracts/dtos/leads.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  @Version('1')
  @UsePipes(new ZodValidationPipe(leadCreateBodySchema))
  @ResponseSchema(leadSubmitResponseSchema)
  @ApiOperation({ summary: 'Submit lead' })
  @ApiBody({ type: LeadCreateBodyDto })
  @ApiCreatedResponse({ type: LeadSubmitResponseDto })
  async create(@Body() body: LeadCreateBody) {
    await this.leads.create({ ...body, source: 'general' });
    return { success: true };
  }

  @Post('cphq')
  @Version('1')
  @UsePipes(new ZodValidationPipe(leadCreateBodySchema))
  @ResponseSchema(leadSubmitResponseSchema)
  @ApiOperation({ summary: 'Submit CPHQ lead (contract route)' })
  @ApiBody({ type: LeadCreateBodyDto })
  @ApiCreatedResponse({ type: LeadSubmitResponseDto })
  createCphq(@Body() body: LeadCreateBody) {
    return this.leads.create({ ...body, source: 'cphq' }).then(() => ({
      success: true,
    }));
  }

  @Post('webinar')
  @Version('1')
  @UsePipes(new ZodValidationPipe(webinarLeadCreateBodySchema))
  @ResponseSchema(leadSubmitResponseSchema)
  @ApiOperation({ summary: 'Submit webinar lead (contract route)' })
  @ApiBody({ type: LeadCreateBodyDto })
  @ApiCreatedResponse({ type: LeadSubmitResponseDto })
  createWebinar(@Body() body: WebinarLeadCreateBody) {
    return this.leads.create({ ...body, source: 'webinar' }).then(() => ({
      success: true,
    }));
  }

  @Get()
  @Version('1')
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'List leads (admin)' })
  @ApiAuth()
  @ApiOkResponse({ description: 'List of leads (not yet contract-mapped)' })
  list() {
    return this.leads.list();
  }
}
