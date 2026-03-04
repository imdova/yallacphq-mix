import { SetMetadata } from '@nestjs/common';
import type { ZodTypeAny } from 'zod';

export const RESPONSE_SCHEMA_KEY = 'responseSchema';
export const ResponseSchema = (schema: ZodTypeAny) =>
  SetMetadata(RESPONSE_SCHEMA_KEY, schema);
