import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';
import { Store } from '@/lib/db/store';
import { RateLimiter } from '@/lib/rate-limiter';
import { Security } from '@/lib/security';
import { logger } from '@/lib/logger';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { chatMessageSchema } from '@/lib/validation/chat';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip || 'unknown';
    RateLimiter.check(`chat:${ip}`, 30, 60 * 1000);

    const message = await req.json();

    // Validate message
    const validatedMessage = chatMessageSchema.safeParse(message);
    if (!validatedMessage.success) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      );
    }

    // Sanitize message content
    const sanitizedMessage = {
      ...validatedMessage.data,
      content: Security.sanitizeInput(validatedMessage.data.content),
    };

    // Store message in chat history
    const state = await Store.load();
    state.chatHistory = [...state.chatHistory, sanitizedMessage].slice(-100);
    await Store.save(state);

    // Broadcast message to all clients
    await pusherServer.trigger(
      CHANNELS.CHAT,
      EVENTS.CHAT.MESSAGE,
      sanitizedMessage
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to send chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}