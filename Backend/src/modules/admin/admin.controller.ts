import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '../../common/auth/role';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from '../../common/swagger/decorators/api-auth.decorator';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  @Get('health')
  @Roles(Role.admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Admin health check' })
  @ApiAuth()
  @ApiOkResponse({ schema: { example: { ok: true } } })
  health() {
    return { ok: true };
  }
}
