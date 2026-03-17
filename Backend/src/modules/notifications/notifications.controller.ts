import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import type { RequestUser } from '../../common/auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  @ApiQuery({
    name: 'unreadOnly',
    required: false,
    type: Boolean,
    description: 'If true, only return unread notifications',
  })
  @ApiOkResponse({
    schema: {
      example: {
        items: [
          {
            id: '65f8c0c2b3f1b2a5c1d2e3f4',
            title: 'Order completed',
            message: 'Order #12345 has been completed',
            type: 'order.completed',
            read: false,
            createdAt: '2024-03-15T10:00:00.000Z',
          },
        ],
      },
    },
  })
  async list(
    @CurrentUser() user: RequestUser,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const items = await this.notifications.listForUser(user.sub, {
      unreadOnly: unreadOnly === 'true',
    });

    return {
      items: items.map((n) => ({
        id: n._id?.toString?.() ?? '',
        title: n.title,
        message: n.message,
        type: n.type,
        read: n.read,
        createdAt: (n as any).createdAt,
      })),
    };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiOkResponse({
    schema: {
      example: { ok: true },
    },
  })
  async markAllRead(@CurrentUser() user: RequestUser) {
    await this.notifications.markAllAsRead(user.sub);
    return { ok: true };
  }
}

