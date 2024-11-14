import { AppError } from './error';

interface RateLimitEntry {
  count: number;
  timestamp: number;
}

export class RateLimiter {
  private static limits: Map<string, RateLimitEntry> = new Map();

  static check(key: string, maxRequests: number, windowMs: number) {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, { count: 1, timestamp: now });
      return;
    }

    if (now - entry.timestamp > windowMs) {
      // Reset if window has passed
      this.limits.set(key, { count: 1, timestamp: now });
      return;
    }

    if (entry.count >= maxRequests) {
      throw AppError.BadRequest('Too many requests. Please try again later.');
    }

    entry.count++;
    this.limits.set(key, entry);
  }

  static async withRateLimit<T>(
    key: string,
    maxRequests: number,
    windowMs: number,
    fn: () => Promise<T>
  ): Promise<T> {
    this.check(key, maxRequests, windowMs);
    return await fn();
  }
}