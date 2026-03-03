import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodError, type ZodTypeAny } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
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
