import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import {
  listWebinarsResponseSchema,
  webinarResponseSchema,
} from '../../contracts';
import {
  ListWebinarsResponseDto,
  WebinarResponseDto,
} from '../../contracts/dtos';
import { toApiWebinar } from './webinar.mapper';
import { WebinarsService } from './webinars.service';

@ApiTags('webinars')
@Controller('webinars')
export class WebinarsController {
  constructor(private readonly webinars: WebinarsService) {}

  @Get()
  @Version('1')
  @ResponseSchema(listWebinarsResponseSchema)
  @ApiOperation({ summary: 'List published webinars' })
  @ApiOkResponse({ type: ListWebinarsResponseDto })
  async list() {
    const items = await this.webinars.listPublished();
    return { items: items.map(toApiWebinar) };
  }

  @Get(':slug')
  @Version('1')
  @ResponseSchema(webinarResponseSchema)
  @ApiOperation({ summary: 'Get published webinar by slug' })
  @ApiOkResponse({ type: WebinarResponseDto })
  async getBySlug(@Param('slug') slug: string) {
    const webinar = await this.webinars.findPublishedBySlug(slug);
    if (!webinar) throw new NotFoundException('Webinar not found');
    return { webinar: toApiWebinar(webinar) };
  }
}
