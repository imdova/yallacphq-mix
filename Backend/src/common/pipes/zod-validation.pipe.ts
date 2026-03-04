import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown) {
    let input = value;
    if (typeof input === 'string') {
      try {
        input = JSON.parse(input) as unknown;
      } catch {
        throw new BadRequestException({
          message: 'Invalid JSON body',
          code: 'INVALID_JSON',
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
