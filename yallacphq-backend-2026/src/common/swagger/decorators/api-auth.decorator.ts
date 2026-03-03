import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiSecurity,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiErrorDto } from '../../../contracts/dtos/common.dto';

type ApiAuthOptions = {
  /**
   * When true, also documents external API key usage (x-api-key).
   * Use for webhook/external-service endpoints.
   */
  externalApiKey?: boolean;
};

export function ApiAuth(options: ApiAuthOptions = {}) {
  return applyDecorators(
    ApiBearerAuth('jwt'),
    ...(options.externalApiKey ? [ApiSecurity('externalApiKey')] : []),
    ApiUnauthorizedResponse({ type: ApiErrorDto, description: 'Unauthorized' }),
    ApiForbiddenResponse({ type: ApiErrorDto, description: 'Forbidden' }),
  );
}
