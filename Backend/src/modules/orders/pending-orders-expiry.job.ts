import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrdersService } from './orders.service';

const ORDER_PENDING_TIMEOUT_HOURS = 3;

@Injectable()
export class PendingOrdersExpiryJob {
  private readonly logger = new Logger(PendingOrdersExpiryJob.name);

  constructor(private readonly orders: OrdersService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expirePendingOrders() {
    const result = await this.orders.failPendingOlderThan(
      ORDER_PENDING_TIMEOUT_HOURS,
    );
    if (result.modifiedCount > 0) {
      this.logger.log(
        `Marked ${result.modifiedCount} pending order(s) as failed after ${ORDER_PENDING_TIMEOUT_HOURS} hour(s).`,
      );
    }
  }
}
