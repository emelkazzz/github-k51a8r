import Pusher from 'pusher';
import { logger } from '../logger';
import { env } from '../config';
import type { PresenceChannelData } from 'pusher';

if (!env.PUSHER_APP_ID || 
    !env.PUSHER_KEY || 
    !env.PUSHER_SECRET || 
    !env.PUSHER_CLUSTER) {
  throw new Error('Missing Pusher configuration');
}

export const pusherServer = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function authorizeChannel(
  socketId: string, 
  channel: string, 
  presenceData?: PresenceChannelData
) {
  try {
    if (channel.startsWith('presence-')) {
      if (!presenceData) {
        throw new Error('Presence data required for presence channels');
      }
      return pusherServer.authorizeChannel(socketId, channel, presenceData);
    }

    if (channel.startsWith('private-')) {
      return pusherServer.authorizeChannel(socketId, channel);
    }

    throw new Error('Invalid channel type');
  } catch (error) {
    logger.error('Channel authorization failed:', error);
    throw error;
  }
}

export async function triggerEvent(channel: string, event: string, data: any) {
  try {
    await pusherServer.trigger(channel, event, data);
    logger.info(`Event triggered: ${event}`, { channel, event });
  } catch (error) {
    logger.error(`Failed to trigger event: ${event}`, error);
    throw error;
  }
}