import { pusherServer } from './server';
import { PUSHER_CONFIG } from './config';
import { logger } from '../logger';
import type { PusherEvent } from './types';

export async function broadcastChatMessage(event: PusherEvent): Promise<void> {
  try {
    await pusherServer.trigger(
      PUSHER_CONFIG.CHANNELS.CHAT,
      PUSHER_CONFIG.EVENTS.CHAT.MESSAGE,
      event.data
    );
    logger.info('Chat message broadcasted');
  } catch (error) {
    logger.error('Failed to broadcast chat message:', error);
    throw error;
  }
}

export async function notifyMemberJoined(member: any): Promise<void> {
  try {
    await pusherServer.trigger(
      PUSHER_CONFIG.CHANNELS.CHAT,
      PUSHER_CONFIG.EVENTS.CHAT.MEMBER_ADDED,
      member
    );
    logger.info('Member joined notification sent');
  } catch (error) {
    logger.error('Failed to notify member joined:', error);
    throw error;
  }
}

export async function notifyMemberLeft(member: any): Promise<void> {
  try {
    await pusherServer.trigger(
      PUSHER_CONFIG.CHANNELS.CHAT,
      PUSHER_CONFIG.EVENTS.CHAT.MEMBER_REMOVED,
      member
    );
    logger.info('Member left notification sent');
  } catch (error) {
    logger.error('Failed to notify member left:', error);
    throw error;
  }
}

export async function broadcastTypingEvent(nickname: string): Promise<void> {
  try {
    await pusherServer.trigger(
      PUSHER_CONFIG.CHANNELS.CHAT,
      PUSHER_CONFIG.EVENTS.CHAT.TYPING,
      { user: nickname }
    );
  } catch (error) {
    logger.error('Failed to broadcast typing event:', error);
    throw error;
  }
}

export async function broadcastChatError(error: Error): Promise<void> {
  try {
    await pusherServer.trigger(
      PUSHER_CONFIG.CHANNELS.CHAT,
      PUSHER_CONFIG.EVENTS.CHAT.ERROR,
      { message: error.message }
    );
  } catch (err) {
    logger.error('Failed to broadcast chat error:', err);
    throw err;
  }
}