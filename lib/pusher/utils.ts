import { PUSHER_CONFIG } from './config';
import type { PusherChannel } from './types';

export function validateChannelName(channel: string): boolean {
  return channel.startsWith('presence-') || channel.startsWith('private-');
}

export function isPresenceChannel(channel: string): boolean {
  return channel.startsWith('presence-');
}

export function isPrivateChannel(channel: string): boolean {
  return channel.startsWith('private-');
}

export function getChannelMembers(channel: PusherChannel): Map<string, any> {
  if (!isPresenceChannel(channel.name)) {
    throw new Error('Not a presence channel');
  }
  return new Map(Object.entries(channel.members || {}));
}

export function calculateBackoff(attempt: number): number {
  const jitter = Math.random() * 1000;
  return Math.min(
    PUSHER_CONFIG.DEFAULTS.RETRY_DELAY * Math.pow(2, attempt) + jitter,
    PUSHER_CONFIG.DEFAULTS.MAX_RETRIES
  );
}