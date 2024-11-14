import { NextRequest, NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher/server';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { type, payload } = data;

    switch (type) {
      case 'NEW_PARTICIPANT':
        await pusherServer.trigger(
          CHANNELS.VAULT,
          EVENTS.VAULT.NEW_PARTICIPANT,
          payload
        );
        break;

      case 'STATUS_UPDATE':
        await pusherServer.trigger(
          CHANNELS.VAULT,
          EVENTS.VAULT.STATUS_UPDATE,
          payload
        );
        break;

      case 'WINNER_SELECTED':
        await pusherServer.trigger(
          CHANNELS.VAULT,
          EVENTS.VAULT.WINNER_SELECTED,
          payload
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Vault update error:', error);
    return NextResponse.json(
      { error: 'Failed to update vault' },
      { status: 500 }
    );
  }
}