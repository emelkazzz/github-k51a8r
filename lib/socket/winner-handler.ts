import { Store } from '../db/store';
import { emailService } from '../email/service';
import { pusherServer } from '../pusher/server';
import { CHANNELS, EVENTS } from '../pusher/constants';
import { logger } from '../logger';
import type { Participant } from '../db/types';

export class WinnerHandler {
  static async handleAutomaticWinnerSelection(): Promise<void> {
    try {
      const state = await Store.load();

      if (state.participants.length === 0) {
        logger.info('No participants available for winner selection');
        return;
      }

      // Select random winner
      const winnerIndex = Math.floor(Math.random() * state.participants.length);
      const winner: Participant = state.participants[winnerIndex];

      // Update state
      state.winner = {
        nickname: winner.nickname,
        email: winner.email,
        amount: state.prizeAmount,
        timestamp: new Date(),
      };

      await Store.save(state);

      // Send winner notification email
      await emailService.sendWinnerNotification({
        nickname: winner.nickname,
        email: winner.email,
        amount: state.prizeAmount,
      });

      // Notify all clients via Pusher
      await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.WINNER_SELECTED, {
        nickname: winner.nickname,
        amount: state.prizeAmount,
        timestamp: new Date(),
      });

      logger.info('Automatic winner selection completed:', {
        nickname: winner.nickname,
        amount: state.prizeAmount,
      });
    } catch (error) {
      logger.error('Failed to select winner automatically:', error);
      throw error;
    }
  }
}