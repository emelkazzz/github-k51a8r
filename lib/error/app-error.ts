export class AppError extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static BadRequest(message: string, details?: any) {
    return new AppError(message, 'BAD_REQUEST', 400, details);
  }

  static Unauthorized(message: string = 'Unauthorized') {
    return new AppError(message, 'UNAUTHORIZED', 401);
  }

  static PaymentFailed(message: string, details?: any) {
    return new AppError(message, 'PAYMENT_FAILED', 400, details);
  }

  static ValidationFailed(message: string, details?: any) {
    return new AppError(message, 'VALIDATION_FAILED', 400, details);
  }

  static RateLimitExceeded(message: string = 'Too many requests') {
    return new AppError(message, 'RATE_LIMIT_EXCEEDED', 429);
  }

  static DatabaseError(message: string, details?: any) {
    return new AppError(message, 'DATABASE_ERROR', 500, details);
  }

  static NetworkError(message: string = 'Network error') {
    return new AppError(message, 'NETWORK_ERROR', 503);
  }
}

export type ErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'PAYMENT_FAILED'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR';

export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};