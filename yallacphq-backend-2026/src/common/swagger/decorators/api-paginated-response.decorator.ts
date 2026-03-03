import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

export function ApiPaginatedResponse<TModel extends Type<unknown>>(
  model: TModel,
  options?: { description?: string },
) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      description: options?.description ?? 'Paginated list',
      schema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          },
          page: { type: 'integer', example: 1, minimum: 1 },
          pageSize: { type: 'integer', example: 20, minimum: 1, maximum: 200 },
          total: { type: 'integer', example: 123, minimum: 0 },
        },
        required: ['items', 'page', 'pageSize', 'total'],
      },
    }),
  );
}
