import { NextRequest, NextResponse } from 'next/server';
import { Store } from '@/lib/db/store';
import { pusherServer } from '@/lib/pusher/server';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { emailService } from '@/lib/email/service';
import { logger } from '@/lib/logger';
import { nanoid } from 'nanoid';
import type { Participant } from '@/lib/db/types';

export async function POST(req: NextRequest) {
  try {
    const { nickname, email } = await req.json();

    // Validate input
    if (!nickname || !email) {
      return NextResponse.json(
        { error: 'Nickname and email are required' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(nickname)) {
      return NextResponse.json(
        { error: 'Invalid nickname format' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const state = await Store.load();

    // Check if nickname is already taken
    if (state.participants.some(p => p.nickname.toLowerCase() === nickname.toLowerCase())) {
      return NextResponse.json(
        { error: 'Nickname already taken' },
        { status: 400 }
      );
    }

    // Create new participant with proper typing
    const participant: Participant = {
      id: nanoid(),
      nickname,
      email,
      timestamp: new Date(),
      verified: true
    };

    // Update state
    state.participants = [participant, ...state.participants];
    state.totalParticipants += 1;
    state.prizeAmount += 10;

    await Store.save(state);

    // Send confirmation email
    await emailService.sendParticipationConfirmation({
      nickname,
      email,
      transactionId: participant.id,
      amount: 10,
      date: new Date().toLocaleString(),
    });

    // Notify all clients
    await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.NEW_PARTICIPANT, {
      id: participant.id,
      nickname: participant.nickname,
      timestamp: participant.timestamp,
    });

    logger.info('Manual participant added:', { nickname, email });

    return NextResponse.json({ 
      success: true,
      participant
    });
  } catch (error) {
    logger.error('Failed to add manual participant:', error);
    return NextResponse.json(
      { error: 'Failed to add participant' },
      { status: 500 }
    );
  }
}