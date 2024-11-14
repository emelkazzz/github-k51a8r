import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '../rate-limiter';
import { Security } from '../security';
import { PusherError } from './errors';
import { logger } from '../logger';

export async function pusherAuthMiddleware(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip || 'unknown';
    RateLimiter.check(`pusher-auth:${ip}`, 100, 60 * 1000);

    // Validate origin in production
    if (process.env.NODE_ENV === 'production') {
      Security.validateOrigin(req);
    }

    // Validate CSRF token in production
    if (process.env.NODE_ENV === 'production') {
      await Security.validateCsrfToken(req);
    }

    return NextResponse.next();
  } catch (error) {
    logger.error('Pusher auth middleware error:', error);

    if (error instanceof PusherError) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}