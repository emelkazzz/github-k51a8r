import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiter } from './lib/rate-limiter';

export async function middleware(req: NextRequest) {
  try {
    // Rate limiting for Pusher endpoints
    if (req.nextUrl.pathname.startsWith('/api/pusher/')) {
      const ip = req.ip || 'unknown';
      RateLimiter.check(`pusher:${ip}`, 100, 60 * 1000); // 100 requests per minute
    }

    // Chat message rate limiting
    if (req.nextUrl.pathname === '/api/chat/send') {
      const ip = req.ip || 'unknown';
      RateLimiter.check(`chat:${ip}`, 30, 60 * 1000); // 30 messages per minute
    }

    // Admin route protection
    if (req.nextUrl.pathname.startsWith('/admin') && 
        !req.nextUrl.pathname.startsWith('/admin/login')) {
      const token = req.cookies.get('admin_token');
      if (!token || token.value !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    const response = NextResponse.next();

    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.pusher.com; connect-src 'self' wss://*.pusher.com https://*.pusher.com; style-src 'self' 'unsafe-inline';"
    );

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
};