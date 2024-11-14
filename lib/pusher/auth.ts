import { pusherServer } from './server';
import { PusherError } from './errors';
import { logger } from '../logger';
import type { ChannelAuthResponse } from './types';

export async function authorizePresenceChannel(
  socketId: string,
  channel: string,
  userData: any
): Promise<ChannelAuthResponse> {
  try {
    if (!userData?.nickname) {
      throw new PusherError(
        'Nickname is required for presence channels',
        'INVALID_USER_DATA'
      );
    }

    const presenceData = {
      user_id: socketId,
      user_info: {
        nickname: userData.nickname,
        joinedAt: new Date().toISOString(),
      },
    };

    return pusherServer.authorizeChannel(socketId, channel, presenceData);
  } catch (error) {
    logger.error('Presence channel authorization failed:', error);
    throw error;
  }
}

export async function authorizePrivateChannel(
  socketId: string,
  channel: string
): Promise<ChannelAuthResponse> {
  try {
    return pusherServer.authorizeChannel(socketId, channel);
  } catch (error) {
    logger.error('Private channel authorization failed:', error);
    throw error;
  }
}

export function validateChannel(channel: string): void {
  if (!channel.startsWith('presence-') && !channel.startsWith('private-')) {
    throw new PusherError(
      'Invalid channel type. Must be presence or private channel.',
      'INVALID_CHANNEL'
    );
  }
}