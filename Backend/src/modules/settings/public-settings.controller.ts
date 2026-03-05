import { Controller, Get, Version } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { studentFieldOptionsResponseSchema } from '../../contracts/settings';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@Controller('settings/student-fields')
export class PublicSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @Version('1')
  @ResponseSchema(studentFieldOptionsResponseSchema)
  @ApiOperation({
    summary: 'Get student field options (public)',
    description: 'Returns countries and specialities for registration/signup forms. No auth required.',
  })
  @ApiOkResponse({
    description: 'Lists of countries and specialities',
    schema: { example: { countries: ['Egypt', 'Saudi Arabia'], specialities: ['Quality Management'] } },
  })
  async getStudentFields() {
    return this.settings.getStudentFieldOptions();
  }
}
