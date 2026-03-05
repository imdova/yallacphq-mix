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
  Query,
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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { Role as AppRole } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  adminDeleteUserResponseSchema,
  adminUpdateUserBodySchema,
  adminUserNullableResponseSchema,
  adminUserResponseSchema,
  createUserBodySchema,
  listUsersResponseSchema,
} from '../../contracts';
import type { CreateUserBody } from '../../contracts';
import {
  ApiOkDto,
  CreateUserBodyDto,
  ListUsersResponseDto,
  AdminUpdateUserBodyDto,
} from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiUser } from './user.mapper';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@ApiTags('admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listUsersResponseSchema)
  @ApiOperation({ summary: 'Admin: list users' })
  @ApiAuth()
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, or phone' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'speciality', required: false, description: 'Filter by speciality' })
  @ApiQuery({ name: 'enrollment', required: false, enum: ['all', 'enrolled', 'not_enrolled'], description: 'Filter by enrollment status' })
  @ApiOkResponse({ type: ListUsersResponseDto })
  async list(
    @Query('search') search?: string,
    @Query('country') country?: string,
    @Query('speciality') speciality?: string,
    @Query('enrollment') enrollment?: 'all' | 'enrolled' | 'not_enrolled',
  ) {
    const items = await this.users.listWithFilters({
      search: search?.trim() || undefined,
      country: country?.trim() || undefined,
      speciality: speciality?.trim() || undefined,
      enrollment: enrollment === 'all' || !enrollment ? undefined : enrollment,
    });
    return { items: items.map(toApiUser) };
  }

  @Post()
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(createUserBodySchema))
  @ResponseSchema(adminUserResponseSchema)
  @ApiOperation({ summary: 'Admin: create user' })
  @ApiAuth()
  @ApiBody({ type: CreateUserBodyDto })
  @ApiCreatedResponse({
    schema: {
      example: {
        user: {
          id: '...',
          email: 'a@b.com',
          name: 'A',
          role: 'student',
          createdAt: '...',
          updatedAt: '...',
        },
      },
    },
  })
  async create(@Body() body: CreateUserBody) {
    const role = body.role === 'admin' ? AppRole.admin : AppRole.student;
    const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
    const created = await this.users.createFromAdmin({
      name: body.name,
      email: body.email,
      role,
      passwordHash,
      phone: body.phone,
      course: body.course,
      country: body.country,
      speciality: body.speciality,
      enrolled: body.enrolled,
    });
    return { user: toApiUser(created) };
  }

  @Get(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminUserNullableResponseSchema)
  @ApiOperation({ summary: 'Admin: get user by id' })
  @ApiAuth()
  @ApiOkResponse({ schema: { example: { user: null } } })
  async getById(@Param('id') id: string) {
    const user = await this.users.findById(id);
    return { user: user ? toApiUser(user) : null };
  }

  @Patch(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminUserResponseSchema)
  @ApiOperation({ summary: 'Admin: update user' })
  @ApiAuth()
  @ApiBody({
    type: AdminUpdateUserBodyDto,
    description: 'Partial user update. All fields optional.',
    examples: {
      full: {
        summary: 'Update profile',
        value: {
          name: 'Alexander Young',
          email: 'student20@example.com',
          role: 'student',
          phone: '+201550148448',
          course: 'aaaaaaaaa',
          country: 'Egypt',
          speciality: 'AAAAAAAAA',
        },
      },
      minimal: {
        summary: 'Update name only',
        value: { name: 'New Name' },
      },
    },
  })
  @ApiOkResponse({
    schema: {
      example: {
        user: {
          id: '...',
          email: 'a@b.com',
          name: 'A',
          role: 'student',
          createdAt: '...',
          updatedAt: '...',
        },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    let rawBody: unknown = req.body;
    if (typeof rawBody === 'string') {
      try {
        rawBody = JSON.parse(rawBody) as unknown;
      } catch {
        throw new BadRequestException({
          message: 'Invalid JSON body',
          code: 'INVALID_JSON',
        });
      }
    }
    if (typeof rawBody !== 'object' || rawBody === null) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: [{ message: 'Body must be a JSON object', path: [], code: 'invalid_type' }],
      });
    }
    const parsed = adminUpdateUserBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: parsed.error.issues,
      });
    }
    const body = parsed.data;
    const patch: Partial<User> = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.email !== undefined) patch.email = body.email;
    if (body.role !== undefined)
      patch.role = body.role === 'admin' ? AppRole.admin : AppRole.student;
    if (body.phone !== undefined) patch.phone = body.phone;
    if (body.course !== undefined) patch.course = body.course;
    if (body.country !== undefined) patch.country = body.country;
    if (body.speciality !== undefined) patch.speciality = body.speciality;
    if (body.enrolled !== undefined) patch.enrolled = body.enrolled;

    const updated = await this.users.updateById(id, patch);
    if (!updated) throw new NotFoundException('User not found');
    return { user: toApiUser(updated) };
  }

  @Delete(':id')
  @Version('1')
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(adminDeleteUserResponseSchema)
  @ApiOperation({ summary: 'Admin: delete user' })
  @ApiAuth()
  @ApiOkResponse({ type: ApiOkDto })
  async remove(@Param('id') id: string) {
    const deleted = await this.users.deleteById(id);
    if (!deleted) throw new NotFoundException('User not found');
    return { ok: true };
  }
}
