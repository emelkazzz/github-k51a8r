import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { logger } from '@/lib/logger';

export async function POST(req: Request) {
  try {
    const { nickname, amount, message } = await req.json();

    await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.WINNER_SELECTED, {
      nickname,
      amount,
      message,
    });

    logger.info('Debug: Test winner announcement triggered', {
      nickname,
      amount,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Debug: Failed to trigger test winner announcement', error);
    return NextResponse.json(
      { error: 'Failed to trigger test' },
      { status: 500 }
    );
  }
}