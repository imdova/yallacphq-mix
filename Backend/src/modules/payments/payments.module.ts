import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { CheckoutController } from './checkout.controller';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PAYMENTS_PROVIDER } from './payments.types';

@Module({
  imports: [CommonModule, OrdersModule, UsersModule],
  controllers: [PaymentsController, CheckoutController],
  providers: [
    PaymentsService,
    {
      provide: PAYMENTS_PROVIDER,
      useValue: null,
    },
  ],
})
export class PaymentsModule {}
