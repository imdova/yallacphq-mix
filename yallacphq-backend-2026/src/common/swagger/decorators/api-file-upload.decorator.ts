import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

type ApiFileUploadOptions = {
  fieldName?: string;
  required?: boolean;
  additionalFields?: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean';
      required?: boolean;
      description?: string;
      example?: unknown;
    }
  >;
};

export function ApiFileUpload(options: ApiFileUploadOptions = {}) {
  const fieldName = options.fieldName ?? 'file';
  const required = options.required ?? true;

  const properties: Record<string, any> = {
    [fieldName]: {
      type: 'string',
      format: 'binary',
      description: 'Binary file upload',
    },
  };

  const requiredFields: string[] = required ? [fieldName] : [];

  for (const [k, v] of Object.entries(options.additionalFields ?? {})) {
    properties[k] = {
      type: v.type,
      description: v.description,
      example: v.example,
    };
    if (v.required) requiredFields.push(k);
  }

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties,
        required: requiredFields.length ? requiredFields : undefined,
      },
    }),
  );
}
