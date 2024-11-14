import { NextRequest, NextResponse } from 'next/server';
import { Store } from '@/lib/db/store';
import { RateLimiter } from '@/lib/rate-limiter';
import { Security } from '@/lib/security';
import { logger } from '@/lib/logger';
import type { ChatMessage } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.ip || 'unknown';
    RateLimiter.check(`chat-history:${ip}`, 30, 60 * 1000); // 30 requests per minute

    // Load chat history from store
    const state = await Store.load();

    // Get last 100 messages and sanitize content
    const messages: ChatMessage[] = state.chatHistory
      .slice(-100)
      .map(msg => ({
        ...msg,
        content: Security.sanitizeInput(msg.content),
      }));

    // Add cache headers
    const response = NextResponse.json({ messages });
    response.headers.set('Cache-Control', 'public, max-age=5');
    response.headers.set('X-Chat-Last-Updated', new Date().toISOString());

    return response;
  } catch (error) {
    logger.error('Failed to fetch chat history:', error);

    if (error instanceof Error && error.message.includes('Too many requests')) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function HEAD(req: NextRequest) {
  return GET(req);
}

// Enable CORS for this route
export const config = {
  cors: {
    methods: ['GET', 'HEAD'],
    headers: [
      'Cache-Control',
      'Content-Type',
      'X-Chat-Last-Updated',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset'
    ],
  },
};