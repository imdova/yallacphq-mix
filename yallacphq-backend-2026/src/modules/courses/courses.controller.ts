import {
  Body,
  Controller,
  Get,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  UsePipes,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { Role } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ApiCourseEndpoints } from '../../common/swagger/decorators/api-course-endpoints.decorator';
import {
  CourseResponseDto,
  CreateCourseBodyDto,
  ListCoursesResponseDto,
  PublicCoursesResponseDto,
} from '../../contracts/dtos';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  adminCourseResponseSchema,
  createCourseBodySchema,
  listCoursesResponseSchema,
  publicCoursesResponseSchema,
} from '../../contracts';
import type { CreateCourseBody } from '../../contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoursesService } from './courses.service';
import { toApiCourse } from './course.mapper';
import { UsersService } from '../users/users.service';
import {
  enrollCourseBodySchema,
  enrollCourseResponseSchema,
  publicCourseResponseSchema,
} from '../../contracts';
import type { EnrollCourseBody } from '../../contracts';

@ApiCourseEndpoints()
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly courses: CoursesService,
    private readonly users: UsersService,
  ) {}

  @Get()
  @Version(['1', VERSION_NEUTRAL])
  @ResponseSchema(publicCoursesResponseSchema)
  @ApiOperation({ summary: 'List public courses' })
  @ApiOkResponse({ type: PublicCoursesResponseDto })
  async listPublished() {
    const items = await this.courses.listPublished();
    return { items: items.map(toApiCourse) };
  }

  @Get('admin')
  @Version(['1', VERSION_NEUTRAL])
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listCoursesResponseSchema)
  @ApiOperation({ summary: 'List all courses (admin)' })
  @ApiAuth()
  @ApiOkResponse({ type: ListCoursesResponseDto })
  async listAll() {
    const items = await this.courses.listAll();
    return { items: items.map(toApiCourse) };
  }

  @Post()
  @Version(['1', VERSION_NEUTRAL])
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(createCourseBodySchema))
  @ResponseSchema(adminCourseResponseSchema)
  @ApiOperation({ summary: 'Create course (admin)' })
  @ApiAuth()
  @ApiBody({ type: CreateCourseBodyDto })
  @ApiCreatedResponse({ type: CourseResponseDto })
  async create(
    @Body() body: CreateCourseBody,
    @CurrentUser() user: RequestUser,
  ) {
    const created = await this.courses.create({
      ...body,
      createdByUserId: user.sub,
    });
    return { course: toApiCourse(created) };
  }

  @Get(':id')
  @Version(['1', VERSION_NEUTRAL])
  @ResponseSchema(publicCourseResponseSchema)
  @ApiOperation({ summary: 'Get public course by id (contract route)' })
  @ApiParam({ name: 'id', example: '65f3c77b0f6d1b5a3d1d9a10' })
  async getPublicById(@Param('id') id: string) {
    const course = await this.courses.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return { course: toApiCourse(course) };
  }

  @Post(':id/enroll')
  @Version(['1', VERSION_NEUTRAL])
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(enrollCourseBodySchema))
  @ResponseSchema(enrollCourseResponseSchema)
  @ApiOperation({ summary: 'Enroll in course (contract route)' })
  @ApiAuth()
  @ApiParam({ name: 'id', example: '65f3c77b0f6d1b5a3d1d9a10' })
  @ApiBody({ schema: { example: {} } })
  async enroll(
    @Param('id') courseId: string,
    @Body() body: EnrollCourseBody,
    @CurrentUser() user: RequestUser,
  ) {
    const course = await this.courses.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const targetUserId = body.userId ?? user.sub;
    if (targetUserId !== user.sub && user.role !== Role.admin) {
      throw new ForbiddenException('Cannot enroll another user');
    }

    await this.users.setEnrolled(targetUserId, true);
    const updatedCourse = await this.courses.incrementEnrolledCount(
      courseId,
      1,
    );

    return {
      ok: true,
      enrolledCount: updatedCourse?.enrolledCount,
    };
  }
}
