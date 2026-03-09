import { Module } from '@nestjs/common';
import { CommonModule } from '../../common/common.module';
import { CoursesModule } from '../courses/courses.module';
import { OrdersModule } from '../orders/orders.module';
import { PromoCodesModule } from '../promo-codes/promo-codes.module';
import { UsersModule } from '../users/users.module';
import { CheckoutController } from './checkout.controller';
import { PaymobController } from './paymob.controller';
import { PaymentsController } from './payments.controller';
import { PaymobService } from './paymob.service';
import { PaypalCaptureService } from './paypal-capture.service';
import { PaymentsService } from './payments.service';
import { PAYMENTS_PROVIDER } from './payments.types';

@Module({
  imports: [CommonModule, OrdersModule, UsersModule, CoursesModule, PromoCodesModule],
  controllers: [PaymentsController, CheckoutController, PaymobController],
  providers: [
    PaymentsService,
    PaypalCaptureService,
    PaymobService,
    {
      provide: PAYMENTS_PROVIDER,
      useValue: null,
    },
  ],
})
export class PaymentsModule {}
