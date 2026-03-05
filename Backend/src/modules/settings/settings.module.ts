import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from '../../common/common.module';
import {
  StudentFieldOptions,
  StudentFieldOptionsSchema,
} from './schemas/student-field-options.schema';
import { SettingsService } from './settings.service';
import { AdminSettingsController } from './admin-settings.controller';
import { PublicSettingsController } from './public-settings.controller';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([
      { name: StudentFieldOptions.name, schema: StudentFieldOptionsSchema },
    ]),
  ],
  controllers: [AdminSettingsController, PublicSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
