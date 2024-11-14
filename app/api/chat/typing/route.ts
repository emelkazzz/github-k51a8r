import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';
import { RateLimiter } from '@/lib/rate-limiter';
import { Security } from '@/lib/security';
import { logger } from '@/lib/logger';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip || 'unknown';
    RateLimiter.check(`chat-typing:${ip}`, 30, 60 * 1000);

    // Parse the raw body as form data
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);
    const nickname = params.get('nickname');
    const userData = params.get('user_data');

    if (!nickname) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    if (!userData) {
      return NextResponse.json(
        { error: 'User data is required' },
        { status: 400 }
      );
    }

    const sanitizedNickname = Security.sanitizeInput(nickname);

    // Broadcast typing event via server
    await pusherServer.trigger(
      CHANNELS.CHAT,
      EVENTS.CHAT.TYPING,
      { user: sanitizedNickname }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to send typing notification:', error);
    return NextResponse.json(
      { error: 'Failed to send typing notification' },
      { status: 500 }
    );
  }
}