import { pusherServer } from './server';
import { PUSHER_CONFIG } from './config';
import { logger } from '../logger';
import type { PusherEvent } from './types';

export class PusherService {
  static async broadcastChatMessage(message: any): Promise<void> {
    try {
      await pusherServer.trigger(
        PUSHER_CONFIG.CHANNELS.CHAT,
        PUSHER_CONFIG.EVENTS.CHAT.MESSAGE,
        message
      );
      logger.info('Chat message broadcasted');
    } catch (error) {
      logger.error('Failed to broadcast chat message:', error);
      throw error;
    }
  }

  static async notifyMemberJoined(member: any): Promise<void> {
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

  static async notifyMemberLeft(member: any): Promise<void> {
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

  static async triggerEvent(event: PusherEvent): Promise<void> {
    try {
      await pusherServer.trigger(
        event.channel,
        event.event,
        event.data
      );
      logger.info(`Event triggered: ${event.event}`);
    } catch (error) {
      logger.error(`Failed to trigger event ${event.event}:`, error);
      throw error;
    }
  }
}