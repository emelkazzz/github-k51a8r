import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { Store } from '@/lib/db/store';
import { logger } from '@/lib/logger';

export async function POST() {
  try {
    // Store current state before preview
    const currentState = await Store.load();

    // Broadcast preview state to all clients
    await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.STATUS_UPDATE, {
      isActive: false,
      isPreview: true,
      previewWinner: {
        nickname: "TestWinner",
        amount: 1000,
        message: "This is a preview of the winner landing page",
      },
    });

    logger.info('Debug: Winner preview mode enabled');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Debug: Failed to enable winner preview', error);
    return NextResponse.json(
      { error: 'Failed to enable preview' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Load current vault state
    const state = await Store.load();

    // Reset preview and restore actual state
    await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.STATUS_UPDATE, {
      isActive: state.isActive,
      isPreview: false,
      previewWinner: null,
      winner: state.winner,
      prizeAmount: state.prizeAmount,
      totalParticipants: state.totalParticipants,
    });

    logger.info('Debug: Winner preview mode disabled');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Debug: Failed to disable winner preview', error);
    return NextResponse.json(
      { error: 'Failed to disable preview' },
      { status: 500 }
    );
  }
}