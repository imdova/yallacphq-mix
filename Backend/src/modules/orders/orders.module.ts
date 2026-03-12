import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../../common/common.module';
import { CoursesModule } from '../courses/courses.module';
import { MailModule } from '../mail/mail.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { UsersModule } from '../users/users.module';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { OrderCompletionService } from './order-completion.service';
import { OrdersService } from './orders.service';
import { PendingOrdersExpiryJob } from './pending-orders-expiry.job';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    UsersModule,
    CoursesModule,
    PromoCodesModule,
    MailModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, PendingOrdersExpiryJob, OrderCompletionService],
  exports: [OrdersService, OrderCompletionService],
})
export class OrdersModule {}
