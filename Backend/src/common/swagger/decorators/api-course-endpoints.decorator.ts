import { applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

/**
 * Course endpoints grouping/tagging helper.
 * Use on the CoursesController to keep Swagger organization consistent.
 */
export function ApiCourseEndpoints() {
  return applyDecorators(ApiTags('courses'));
}
