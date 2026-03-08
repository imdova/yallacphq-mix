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
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
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
  adminEnrollUserBodySchema,
  adminEnrollUserResponseSchema,
  createCourseBodySchema,
  listCoursesResponseSchema,
  updateCourseBodySchema,
} from '../../contracts';
import type { CreateCourseBody, AdminEnrollUserBody } from '../../contracts';
import {
  ApiOkDto,
  CourseResponseDto,
  CreateCourseBodyDto,
  ListCoursesResponseDto,
} from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiCourse } from './course.mapper';
import { CoursesService } from './courses.service';
import { UsersService } from '../users/users.service';
import { toApiUser } from '../users/user.mapper';

@ApiTags('admin', 'courses')
@Controller('admin/courses')
export class AdminCoursesController {
  constructor(
    private readonly courses: CoursesService,
    private readonly users: UsersService,
  ) {}

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
  async create(
    @Body(new ZodValidationPipe(createCourseBodySchema))
    body: CreateCourseBody,
    @CurrentUser() user: RequestUser,
  ) {
    const created = await this.courses.create({
      ...body,
      createdByUserId: user.sub,
    });
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
  @ResponseSchema(adminCourseResponseSchema)
  @ApiOperation({ summary: 'Admin: update course' })
  @ApiAuth()
  @ApiOkResponse({ type: CourseResponseDto })
  async update(@Param('id') id: string, @Req() req: Request) {
    const raw = req.body;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: [{ message: 'Body must be a JSON object', path: [], code: 'invalid_type' }],
      });
    }
    const parsed = updateCourseBodySchema.safeParse(raw);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      });
    }
    const updated = await this.courses.updateById(id, parsed.data);
    if (!updated) throw new NotFoundException('Course not found');
    return { course: toApiCourse(updated) };
  }

  @Post(':id/enroll-user')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminEnrollUserResponseSchema)
  @ApiOperation({ summary: 'Admin: enroll a user in this course' })
  @ApiAuth()
  @ApiBody({ schema: { example: { userId: '65f3c77b0f6d1b5a3d1d9a10' } } })
  @ApiOkResponse({ schema: { example: { ok: true, user: {} } } })
  async enrollUser(
    @Param('id') courseId: string,
    @Req() req: Request,
  ) {
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
    const parsed = adminEnrollUserBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      });
    }
    const body: AdminEnrollUserBody = parsed.data;

    const course = await this.courses.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');
    const user = await this.users.findById(body.userId);
    if (!user) throw new NotFoundException('User not found');
    const newlyAdded = await this.users.addEnrolledCourse(body.userId, courseId);
    if (newlyAdded) {
      await this.courses.incrementEnrolledCount(courseId, 1);
    }
    await this.users.updateById(body.userId, { course: course.title });
    const updatedUser = await this.users.findById(body.userId);
    return {
      ok: true as const,
      user: updatedUser ? toApiUser(updatedUser) : undefined,
    };
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
