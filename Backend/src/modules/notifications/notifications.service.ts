import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';

export interface CreateNotificationInput {
  userId: Types.ObjectId | string;
  title: string;
  message: string;
  type: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(input: CreateNotificationInput) {
    const userObjectId =
      typeof input.userId === 'string'
        ? new Types.ObjectId(input.userId)
        : input.userId;

    const created = await this.notificationModel.create({
      userId: userObjectId,
      title: input.title,
      message: input.message,
      type: input.type,
      metadata: input.metadata ?? undefined,
    });

    return created;
  }

  async listForUser(userId: Types.ObjectId | string, opts?: { unreadOnly?: boolean }) {
    const userObjectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    const query: Record<string, unknown> = { userId: userObjectId };
    if (opts?.unreadOnly) {
      query.read = false;
    }

    return this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async markAllAsRead(userId: Types.ObjectId | string) {
    const userObjectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;

    await this.notificationModel.updateMany(
      { userId: userObjectId, read: false },
      { $set: { read: true } },
    );
  }
}

