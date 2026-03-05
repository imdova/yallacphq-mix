import { Body, Controller, Get, Patch, UseGuards, UsePipes, Version } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role as AppRole } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  studentFieldOptionsResponseSchema,
  updateStudentFieldOptionsBodySchema,
  type UpdateStudentFieldOptionsBody,
} from '../../contracts/settings';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';

@ApiTags('admin', 'settings')
@Controller('admin/settings/student-fields')
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(studentFieldOptionsResponseSchema)
  @ApiOperation({ summary: 'Admin: get student field options (countries, specialities)' })
  @ApiAuth()
  @ApiOkResponse({
    description: 'Lists of countries and specialities for student forms',
    schema: { example: { countries: ['Egypt', 'Saudi Arabia'], specialities: ['Quality Management'] } },
  })
  async getStudentFields() {
    return this.settings.getStudentFieldOptions();
  }

  @Patch()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(updateStudentFieldOptionsBodySchema))
  @ResponseSchema(studentFieldOptionsResponseSchema)
  @ApiOperation({ summary: 'Admin: update student field options' })
  @ApiAuth()
  @ApiBody({
    description: 'Countries and/or specialities lists (replaces the list for provided keys)',
    schema: {
      example: { countries: ['Egypt', 'Saudi Arabia'], specialities: ['Quality Management', 'Patient Safety'] },
    },
  })
  @ApiOkResponse({
    description: 'Updated lists of countries and specialities',
    schema: { example: { countries: ['Egypt'], specialities: ['Quality Management'] } },
  })
  async updateStudentFields(@Body() body: UpdateStudentFieldOptionsBody) {
    return this.settings.updateStudentFieldOptions(body);
  }
}
