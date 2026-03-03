export type ApiSuccessResponse<T> = {
  success: true;
  timestamp: string;
  requestId?: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  timestamp: string;
  requestId?: string;
  error: {
    message: string;
    statusCode: number;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
