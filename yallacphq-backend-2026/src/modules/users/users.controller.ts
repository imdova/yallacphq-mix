import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { Role } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import {
  CurrentUserResponseDto,
  ListUsersResponseDto,
} from '../../contracts/dtos';
import {
  currentUserResponseSchema,
  listUsersResponseSchema,
} from '../../contracts';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { toApiUser } from './user.mapper';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(currentUserResponseSchema)
  @ApiOperation({ summary: 'Current user profile' })
  @ApiAuth()
  @ApiOkResponse({ type: CurrentUserResponseDto })
  async me(@CurrentUser() user: RequestUser) {
    const dbUser = await this.users.findById(user.sub);
    if (!dbUser) throw new UnauthorizedException();
    return { user: toApiUser(dbUser) };
  }

  @Get()
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ResponseSchema(listUsersResponseSchema)
  @ApiOperation({ summary: 'List users (admin)' })
  @ApiAuth()
  @ApiOkResponse({ type: ListUsersResponseDto })
  async list() {
    const users = await this.users.list();
    return { items: users.map(toApiUser) };
  }
}
