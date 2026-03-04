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
  adminCourseNullableResponseSchema,
  adminCourseResponseSchema,
  adminDeleteCourseResponseSchema,
  createCourseBodySchema,
  listCoursesResponseSchema,
  updateCourseBodySchema,
} from '../../contracts';
import type { CreateCourseBody, UpdateCourseBody } from '../../contracts';
import {
  ApiOkDto,
  CourseResponseDto,
  CreateCourseBodyDto,
  ListCoursesResponseDto,
} from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiCourse } from './course.mapper';
import { CoursesService } from './courses.service';

@ApiTags('admin', 'courses')
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listCoursesResponseSchema)
  @ApiOperation({ summary: 'Admin: list courses' })
  @ApiAuth()
  @ApiOkResponse({ type: ListCoursesResponseDto })
  async list() {
    const items = await this.courses.listAll();
    return { items: items.map(toApiCourse) };
  }

  @Post()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(createCourseBodySchema))
  @ResponseSchema(adminCourseResponseSchema)
  @ApiOperation({
    summary: 'Admin: create course',
    description: 'Create a new course. Requires admin role. JWT Bearer token required.',
  })
  @ApiAuth()
  @ApiBody({
    type: CreateCourseBodyDto,
    description: 'Course payload. Required: title, tag, instructorName, instructorTitle, durationHours.',
    examples: {
      minimal: {
        summary: 'Minimal',
        value: {
          title: 'CPHQ Exam Prep 2026',
          tag: 'CPHQ',
          instructorName: 'Dr. A. Instructor',
          instructorTitle: 'Quality Director',
          durationHours: 12,
        },
      },
      full: {
        summary: 'With optional fields',
        value: {
          title: 'CPHQ Exam Prep 2026',
          tag: 'CPHQ',
          instructorName: 'Dr. A. Instructor',
          instructorTitle: 'Quality Director',
          durationHours: 12,
          status: 'draft',
          visibility: 'public',
          description: 'A complete course to prepare for the CPHQ certification exam.',
          whoCanAttend: 'Healthcare quality professionals',
          whyYalla: 'Expert instructors and practice exams',
          includes: 'Videos, PDFs, mock exams',
          enableEnrollment: true,
          priceRegular: 399,
          priceSale: 299,
          currency: 'usd',
          lessons: 24,
          level: 'Intermediate',
          certificationType: 'CPHQ Prep',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: CourseResponseDto, description: 'Created course with id, timestamps, and defaults' })
  async create(@Body() body: CreateCourseBody) {
    const created = await this.courses.create(body);
    return { course: toApiCourse(created) };
  }

  @Get(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminCourseNullableResponseSchema)
  @ApiOperation({ summary: 'Admin: get course by id' })
  @ApiAuth()
  @ApiOkResponse({ schema: { example: { course: null } } })
  async getById(@Param('id') id: string) {
    const course = await this.courses.findById(id);
    return { course: course ? toApiCourse(course) : null };
  }

  @Patch(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(updateCourseBodySchema))
  @ResponseSchema(adminCourseResponseSchema)
  @ApiOperation({ summary: 'Admin: update course' })
  @ApiAuth()
  @ApiOkResponse({ type: CourseResponseDto })
  async update(@Param('id') id: string, @Body() body: UpdateCourseBody) {
    const updated = await this.courses.updateById(id, body);
    if (!updated) throw new NotFoundException('Course not found');
    return { course: toApiCourse(updated) };
  }

  @Delete(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminDeleteCourseResponseSchema)
  @ApiOperation({ summary: 'Admin: delete course' })
  @ApiAuth()
  @ApiOkResponse({ type: ApiOkDto })
  async remove(@Param('id') id: string) {
    const deleted = await this.courses.deleteById(id);
    if (!deleted) throw new NotFoundException('Course not found');
    return { ok: true };
  }
}
