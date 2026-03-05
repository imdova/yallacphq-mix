import {
  BadRequestException,
  Controller,
  Get,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
  Version,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { Role } from '../../common/auth/role';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ApiCourseEndpoints } from '../../common/swagger/decorators/api-course-endpoints.decorator';
import { PublicCoursesResponseDto } from '../../contracts/dtos';
import {
  enrollCourseBodySchema,
  enrollCourseResponseSchema,
  publicCourseResponseSchema,
  publicCoursesResponseSchema,
} from '../../contracts';
import type { EnrollCourseBody } from '../../contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { toApiCourse } from './course.mapper';
import { UsersService } from '../users/users.service';

@ApiCourseEndpoints()
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courses: CoursesService,
    private readonly users: UsersService,
  ) {}

  @Get()
  @Version('1')
  @ResponseSchema(publicCoursesResponseSchema)
  @ApiOperation({ summary: 'List public courses' })
  @ApiOkResponse({ type: PublicCoursesResponseDto })
  async listPublished() {
    const items = await this.courses.listPublished();
    return { items: items.map(toApiCourse) };
  }

  @Get('mine')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(publicCoursesResponseSchema)
  @ApiOperation({ summary: 'List my enrolled courses' })
  @ApiAuth()
  @ApiOkResponse({ type: PublicCoursesResponseDto })
  async getMyCourses(@CurrentUser() user: RequestUser) {
    const courseIds = await this.users.getEnrolledCourseIds(user.sub);
    const courses = await Promise.all(
      courseIds.map((id) => this.courses.findById(id)),
    );
    const items = courses
      .filter((c): c is NonNullable<typeof c> => c != null)
      .map(toApiCourse);
    return { items };
  }

  @Get(':id')
  @Version('1')
  @ResponseSchema(publicCourseResponseSchema)
  @ApiOperation({ summary: 'Get public course by id' })
  @ApiParam({ name: 'id', example: '65f3c77b0f6d1b5a3d1d9a10' })
  async getPublicById(@Param('id') id: string) {
    const course = await this.courses.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return { course: toApiCourse(course) };
  }

  @Post(':id/enroll')
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(enrollCourseResponseSchema)
  @ApiOperation({ summary: 'Enroll in course' })
  @ApiAuth()
  @ApiParam({ name: 'id', example: '65f3c77b0f6d1b5a3d1d9a10' })
  @ApiBody({ schema: { example: {} } })
  async enroll(
    @Param('id') courseId: string,
    @Req() req: Request,
    @CurrentUser() user: RequestUser,
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
    const parsed = enrollCourseBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      });
    }
    const body: EnrollCourseBody = parsed.data;

    const course = await this.courses.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const targetUserId = body.userId ?? user.sub;
    if (targetUserId !== user.sub && user.role !== Role.admin) {
      throw new ForbiddenException('Cannot enroll another user');
    }

    const newlyAdded = await this.users.addEnrolledCourse(targetUserId, courseId);
    if (newlyAdded) {
      await this.courses.incrementEnrolledCount(courseId, 1);
    }

    const updatedCourse = await this.courses.findById(courseId);

    return {
      ok: true,
      enrolledCount: updatedCourse?.enrolledCount,
    };
  }
}
