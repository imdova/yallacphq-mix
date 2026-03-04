import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import type { ZodTypeAny } from 'zod';
import { SKIP_RESPONSE_WRAP_KEY } from '../decorators/skip-response-wrap.decorator';
import { RESPONSE_SCHEMA_KEY } from '../decorators/response-schema.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_RESPONSE_WRAP_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (skip) return next.handle();

    const responseSchema = this.reflector.getAllAndOverride<ZodTypeAny>(
      RESPONSE_SCHEMA_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next
      .handle()
      .pipe(
        map((data: unknown) =>
          responseSchema ? responseSchema.parse(data) : data,
        ),
      );
  }
}
