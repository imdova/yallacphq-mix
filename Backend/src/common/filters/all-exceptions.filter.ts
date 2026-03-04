import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

function extractHttpExceptionMessage(res: unknown): string | undefined {
  if (typeof res === 'string') return res;
  if (!res || typeof res !== 'object') return undefined;
  const maybe = (res as { message?: unknown }).message;
  if (typeof maybe === 'string') return maybe;
  if (Array.isArray(maybe) && maybe.every((x) => typeof x === 'string')) {
    return maybe.join(', ');
  }
  return undefined;
}

function isMongoDuplicateKeyError(
  err: unknown,
): err is { code: number; keyValue?: unknown } {
  if (typeof err !== 'object' || err === null) return false;
  const rec = err as Record<string, unknown>;
  return rec['code'] === 11000;
}

function isMongooseCastError(
  err: unknown,
): err is { name: string; path?: string; value?: unknown } {
  if (typeof err !== 'object' || err === null) return false;
  const rec = err as Record<string, unknown>;
  return rec['name'] === 'CastError';
}

function isMongooseValidationError(
  err: unknown,
): err is { name: string; errors?: unknown } {
  if (typeof err !== 'object' || err === null) return false;
  const rec = err as Record<string, unknown>;
  return rec['name'] === 'ValidationError';
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // request id is attached as header by middleware; do not include extra fields in body
    // because frontend parses strict response schemas.
    void request.id;

    if (exception instanceof ZodError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: exception.issues,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message = extractHttpExceptionMessage(res) ?? 'Request failed';

      const issues =
        typeof res === 'object' && res !== null
          ? (res as { issues?: unknown }).issues
          : undefined;

      return response.status(status).json({
        message,
        code:
          status === 401
            ? 'UNAUTHORIZED'
            : status === 403
              ? 'FORBIDDEN'
              : undefined,
        issues: Array.isArray(issues) ? issues : undefined,
      });
    }

    if (isMongoDuplicateKeyError(exception)) {
      return response.status(HttpStatus.CONFLICT).json({
        message: 'Duplicate key',
        code: 'DUPLICATE_KEY',
      });
    }

    if (isMongooseCastError(exception)) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'Invalid id',
        code: 'INVALID_ID',
      });
    }

    if (isMongooseValidationError(exception)) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    });
  }
}
