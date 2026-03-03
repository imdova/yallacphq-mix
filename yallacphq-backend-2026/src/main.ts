import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    rawBody: true,
  });

  app.useLogger(app.get(Logger));

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Yalla CPHQ API')
    .setDescription('Backend API documentation for Yalla CPHQ platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste a JWT access token: `Bearer <token>`',
      },
      'jwt',
    )
    .addApiKey(
      {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key for external services (webhooks/integrations)',
      },
      'externalApiKey',
    )
    .addServer('http://localhost:3000', 'development')
    .addServer('https://api-staging.yallacphq.com', 'staging')
    .addServer('https://api.yallacphq.com', 'production')
    .addTag('auth')
    .addTag('users')
    .addTag('courses')
    .addTag('orders')
    .addTag('payments')
    .addTag('promo-codes')
    .addTag('leads')
    .addTag('admin')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}.${methodKey}`,
  });

  SwaggerModule.setup('api/docs', app, swaggerDoc, {
    swaggerOptions: { persistAuthorization: true },
  });

  app.enableCors();
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
