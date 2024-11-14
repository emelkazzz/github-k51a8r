import { scheduleJob } from 'node-schedule';
import { Store } from './db/store';
import { emailService } from './email/service';
import { logger } from './logger';
import { BackupService } from './db/backup';
import { WinnerHandler } from './socket/winner-handler';
import { pusherServer } from './pusher/server';
import { CHANNELS, EVENTS } from './pusher/constants';

export class CronService {
  private static isVaultActive = true;

  static getVaultStatus() {
    return this.isVaultActive;
  }

  static initializeJobs() {
    // Check current time and set initial vault status
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday
    const currentHour = now.getHours();

    // If it's Sunday after midnight or Monday before 10 AM, vault should be inactive
    if ((currentDay === 0 && currentHour >= 0) || 
        (currentDay === 1 && currentHour < 10)) {
      this.isVaultActive = false;
    }

    // Close vault and finalize winner every Sunday at midnight (00:00) French time
    scheduleJob('0 0 * * 0', async () => {
      try {
        logger.info('Starting vault closure process');
        this.isVaultActive = false;
        
        const state = await Store.load();
        
        // If no manual winner was selected, select one automatically
        if (!state.winner) {
          await WinnerHandler.handleAutomaticWinnerSelection();
        }

        // Update vault status
        state.isActive = false;
        await Store.save(state);

        // Notify all clients
        await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.STATUS_UPDATE, { 
          isActive: false,
          message: 'The lottery is now closed. New round starts Monday at 10:00.',
        });

        logger.info('Vault closure completed');
      } catch (error) {
        logger.error('Failed to process vault closure', error);
      }
    });

    // Reset vault every Monday at 10:00 AM French time
    scheduleJob('0 10 * * 1', async () => {
      try {
        logger.info('Starting vault reset process');
        this.isVaultActive = true;
        
        const state = await Store.load();
        state.prizeAmount = 0;
        state.participants = [];
        state.totalParticipants = 0;
        state.winner = null;
        state.isActive = true;
        
        await Store.save(state);
        
        await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.STATUS_UPDATE, { 
          isActive: true,
          message: 'New lottery round has started!',
        });
        
        logger.info('Vault reset completed');
      } catch (error) {
        logger.error('Failed to reset vault', error);
        
        // Try to restore from backup
        try {
          const backup = await BackupService.restoreLatestBackup();
          if (backup) {
            await Store.save(backup);
            logger.info('System restored from backup after failed reset');
          }
        } catch (backupError) {
          logger.error('Failed to restore from backup', backupError);
        }
      }
    });

    logger.info('Cron jobs initialized');
  }
}