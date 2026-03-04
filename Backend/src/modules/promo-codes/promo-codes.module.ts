import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../../common/common.module';
import { CoursesModule } from '../courses/courses.module';
import { PromoCodesController } from './promo-codes.controller';
import { AdminPromoCodesController } from './admin-promo-codes.controller';
import { PromoCodesService } from './promo-codes.service';
import { PromoCode, PromoCodeSchema } from './schemas/promo-code.schema';

@Module({
  imports: [
    CommonModule,
    CoursesModule,
    MongooseModule.forFeature([
      { name: PromoCode.name, schema: PromoCodeSchema },
    ]),
  ],
  controllers: [PromoCodesController, AdminPromoCodesController],
  providers: [PromoCodesService],
})
export class PromoCodesModule {}
