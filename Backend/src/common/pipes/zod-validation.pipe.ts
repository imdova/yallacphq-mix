import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown) {
    let input = value;
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!trimmed) {
        throw new BadRequestException({
          message: 'Body must be a JSON object',
          code: 'VALIDATION_ERROR',
          issues: [{ message: 'Body is empty or whitespace', path: [], code: 'invalid_type' }],
        });
      }
      if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        throw new BadRequestException({
          message: 'Invalid JSON body',
          code: 'INVALID_JSON',
          details: 'Body must be valid JSON (object or array). Send with Content-Type: application/json.',
        });
      }
      try {
        input = JSON.parse(trimmed) as unknown;
      } catch (parseErr) {
        const detail =
          parseErr instanceof Error ? parseErr.message : 'JSON parse failed';
        throw new BadRequestException({
          message: 'Invalid JSON body',
          code: 'INVALID_JSON',
          details: detail,
        });
      }
    }
    if (typeof input !== 'object' || input === null) {
      throw new BadRequestException({
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        issues: [{ message: 'Body must be a JSON object', path: [], code: 'invalid_type' }],
      });
    }
    try {
      return this.schema.parse(input);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          issues: err.issues,
        });
      }
      throw err;
    }
  }
}
