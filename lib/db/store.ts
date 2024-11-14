import fs from 'fs/promises';
import path from 'path';
import { BackupService } from './backup';
import { logger } from '../logger';
import type { VaultState } from './types';

const DB_PATH = path.join(process.cwd(), 'data');
const VAULT_FILE = path.join(DB_PATH, 'vault.json');

const DEFAULT_STATE: VaultState = {
  prizeAmount: 0,
  participants: [],
  totalParticipants: 0,
  winner: null,
  chatHistory: [],
  isActive: true,
};

export class Store {
  static async load(): Promise<VaultState> {
    try {
      await fs.mkdir(DB_PATH, { recursive: true });
      
      try {
        const data = await fs.readFile(VAULT_FILE, 'utf-8');
        return JSON.parse(data) as VaultState;
      } catch (error) {
        // If file doesn't exist or is corrupted, try to restore from backup
        const backup = await BackupService.restoreLatestBackup();
        if (backup) {
          logger.info('Restored vault state from backup');
          return backup;
        }

        // If no backup exists, create new state
        logger.info('Initializing new vault state');
        await this.save(DEFAULT_STATE);
        return DEFAULT_STATE;
      }
    } catch (error) {
      logger.error('Failed to load vault state:', error);
      throw error;
    }
  }

  static async save(state: VaultState): Promise<void> {
    try {
      await fs.mkdir(DB_PATH, { recursive: true });
      
      // Create backup before saving
      await BackupService.createBackup(state);
      
      // Save new state
      await fs.writeFile(
        VAULT_FILE,
        JSON.stringify(state, null, 2),
        { encoding: 'utf-8' }
      );

      logger.info('Vault state saved successfully');
    } catch (error) {
      logger.error('Failed to save vault state:', error);
      throw error;
    }
  }

  static async update(updater: (state: VaultState) => VaultState | Promise<VaultState>): Promise<VaultState> {
    try {
      const currentState = await this.load();
      const newState = await updater(currentState);
      await this.save(newState);
      return newState;
    } catch (error) {
      logger.error('Failed to update vault state:', error);
      throw error;
    }
  }

  static async reset(): Promise<void> {
    try {
      await this.save(DEFAULT_STATE);
      logger.info('Vault state reset to defaults');
    } catch (error) {
      logger.error('Failed to reset vault state:', error);
      throw error;
    }
  }
}