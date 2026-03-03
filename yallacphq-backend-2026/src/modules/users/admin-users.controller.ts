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
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
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
import type { AdminUpdateUserBody, CreateUserBody } from '../../contracts';
import {
  ApiOkDto,
  CreateUserBodyDto,
  ListUsersResponseDto,
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
  @Version(['1', VERSION_NEUTRAL])
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listUsersResponseSchema)
  @ApiOperation({ summary: 'Admin: list users' })
  @ApiAuth()
  @ApiOkResponse({ type: ListUsersResponseDto })
  async list() {
    const items = await this.users.list();
    return { items: items.map(toApiUser) };
  }

  @Post()
  @Version(['1', VERSION_NEUTRAL])
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
  @Version(['1', VERSION_NEUTRAL])
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
  @Version(['1', VERSION_NEUTRAL])
  @Roles(AppRole.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ZodValidationPipe(adminUpdateUserBodySchema))
  @ResponseSchema(adminUserResponseSchema)
  @ApiOperation({ summary: 'Admin: update user' })
  @ApiAuth()
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
  async update(@Param('id') id: string, @Body() body: AdminUpdateUserBody) {
    const patch: Partial<User> = {
      ...body,
      role: body.role
        ? body.role === 'admin'
          ? AppRole.admin
          : AppRole.student
        : undefined,
    };
    const updated = await this.users.updateById(id, patch);
    if (!updated) throw new NotFoundException('User not found');
    return { user: toApiUser(updated) };
  }

  @Delete(':id')
  @Version(['1', VERSION_NEUTRAL])
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
