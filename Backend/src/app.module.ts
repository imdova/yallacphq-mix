import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { validateEnv } from './config/env.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ContractsModule } from './contracts/contracts.module';
import { DatabaseModule } from './database/database.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CartModule } from './modules/cart/cart.module';
import { CoursesModule } from './modules/courses/courses.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromoCodesModule } from './modules/promo-codes/promo-codes.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsersModule } from './modules/users/users.module';
import { randomUUID } from 'crypto';

function getRequestId(req: unknown): string | undefined {
  if (!req || typeof req !== 'object') return undefined;
  const id = (req as { id?: unknown }).id;
  return typeof id === 'string' && id.trim() ? id : undefined;
}

function getOrCreateRequestId(req: unknown): string {
  return getRequestId(req) ?? cryptoRandomId();
}

function cryptoRandomId(): string {
  return randomUUID();
}

function getReqBasics(req: unknown): { method?: string; url?: string } {
  if (!req || typeof req !== 'object') return {};
  const r = req as { method?: unknown; url?: unknown };
  return {
    method: typeof r.method === 'string' ? r.method : undefined,
    url: typeof r.url === 'string' ? r.url : undefined,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      validate: validateEnv,
    }),
    ScheduleModule.forRoot(),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV', 'development');
        const level = config.get<string>('LOG_LEVEL', 'info');
        return {
          pinoHttp: {
            level,
            genReqId: (req: unknown) => getOrCreateRequestId(req),
            customProps: (req: unknown) => ({ requestId: getRequestId(req) }),
            serializers: {
              req(req: unknown) {
                const id = getRequestId(req);
                const basics = getReqBasics(req);
                return {
                  id,
                  method: basics.method,
                  url: basics.url,
                };
              },
            },
            transport:
              nodeEnv !== 'production'
                ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      singleLine: true,
                      translateTime: 'SYS:standard',
                    },
                  }
                : undefined,
          },
        };
      },
    }),
    ContractsModule,
    CommonModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    CartModule,
    CoursesModule,
    OrdersModule,
    PaymentsModule,
    PromoCodesModule,
    LeadsModule,
    SettingsModule,
    UploadModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
