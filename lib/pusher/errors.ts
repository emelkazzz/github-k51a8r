export class PusherError extends Error {
  constructor(
    message: string,
    public code: string,
    public data?: any
  ) {
    super(message);
    this.name = 'PusherError';
  }

  static ConnectionFailed(message: string = 'Connection failed') {
    return new PusherError(message, 'CONNECTION_FAILED');
  }

  static AuthenticationFailed(message: string = 'Authentication failed') {
    return new PusherError(message, 'AUTH_FAILED');
  }

  static SubscriptionFailed(message: string = 'Channel subscription failed') {
    return new PusherError(message, 'SUBSCRIPTION_FAILED');
  }

  static RateLimitExceeded(message: string = 'Too many requests') {
    return new PusherError(message, 'RATE_LIMIT_EXCEEDED');
  }
}