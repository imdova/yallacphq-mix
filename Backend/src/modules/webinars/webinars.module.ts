import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../../common/common.module';
import { AdminWebinarsController } from './admin-webinars.controller';
import { Webinar, WebinarSchema } from './schemas/webinar.schema';
import { WebinarsController } from './webinars.controller';
import { WebinarsService } from './webinars.service';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([{ name: Webinar.name, schema: WebinarSchema }]),
  ],
  controllers: [AdminWebinarsController, WebinarsController],
  providers: [WebinarsService],
  exports: [WebinarsService],
})
export class WebinarsModule {}
