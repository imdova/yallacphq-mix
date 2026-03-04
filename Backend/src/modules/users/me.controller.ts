import {
  Body,
  Controller,
  Get,
  Patch,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  Version,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { ResponseSchema } from '../../common/decorators/response-schema.decorator';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  currentUserResponseSchema,
  updateCurrentUserBodySchema,
} from '../../contracts';
import type { UpdateCurrentUserBody } from '../../contracts';
import { CurrentUserResponseDto } from '../../contracts/dtos';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { toApiUser } from './user.mapper';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('me')
export class MeController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @ResponseSchema(currentUserResponseSchema)
  @ApiOperation({ summary: 'Get current user (contract route)' })
  @ApiAuth()
  @ApiOkResponse({ type: CurrentUserResponseDto })
  async getMe(@CurrentUser() user: RequestUser) {
    const dbUser = await this.users.findById(user.sub);
    if (!dbUser) throw new UnauthorizedException();
    return { user: toApiUser(dbUser) };
  }

  @Patch()
  @Version('1')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateCurrentUserBodySchema))
  @ResponseSchema(currentUserResponseSchema)
  @ApiOperation({ summary: 'Update current user (contract route)' })
  @ApiAuth()
  @ApiBody({
    schema: {
      example: { name: 'Jane Student', phone: '+45 12 34 56 78' },
    },
  })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  async updateMe(
    @Body() body: UpdateCurrentUserBody,
    @CurrentUser() user: RequestUser,
  ) {
    const updated = await this.users.updateCurrentUser(user.sub, body);
    if (!updated) throw new UnauthorizedException();
    return { user: toApiUser(updated) };
  }
}
