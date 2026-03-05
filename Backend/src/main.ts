import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { Logger } from 'nestjs-pino';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  // Custom JSON body parser so req.body is always populated (fixes empty body on versioned routes)
  const JSON_BODY_LIMIT = 10 * 1024 * 1024; // 10mb
  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.method === 'GET' || req.method === 'HEAD') return next();
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (!ct.includes('application/json')) return next();
    const chunks: Buffer[] = [];
    let length = 0;
    req.on('data', (chunk: Buffer) => {
      length += chunk.length;
      if (length > JSON_BODY_LIMIT) {
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        (req as express.Request & { body: unknown }).body = raw?.trim() ? JSON.parse(raw) : {};
      } catch {
        (req as express.Request & { body: unknown }).body = {};
      }
      next();
    });
    req.on('error', next);
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
    .addServer(`http://localhost:${process.env.PORT ?? 3001}`, 'development')
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

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
