import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { Store } from '@/lib/db/store';
import { emailService } from '@/lib/email/service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { participantId } = await req.json();
    const state = await Store.load();

    if (!state.isActive) {
      return NextResponse.json(
        { error: 'The vault is currently closed' },
        { status: 400 }
      );
    }

    const participant = state.participants.find(p => p.id === participantId);
    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Update state with winner but keep vault active
    state.winner = {
      nickname: participant.nickname,
      email: participant.email,
      amount: state.prizeAmount,
      timestamp: new Date(),
    };

    // Save state
    await Store.save(state);

    // Send winner notification email
    await emailService.sendWinnerNotification({
      nickname: participant.nickname,
      email: participant.email,
      amount: state.prizeAmount,
    });

    // Notify all clients about winner selection
    await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.WINNER_SELECTED, {
      nickname: participant.nickname,
      amount: state.prizeAmount,
      timestamp: new Date(),
      message: 'Winner has been selected but the lottery remains open until Sunday midnight',
    });

    logger.info('Manual winner selection:', {
      nickname: participant.nickname,
      amount: state.prizeAmount,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Winner selected successfully. Vault remains active until scheduled end time.'
    });
  } catch (error) {
    logger.error('Winner selection error:', error);
    return NextResponse.json(
      { error: 'Failed to select winner' },
      { status: 500 }
    );
  }
}