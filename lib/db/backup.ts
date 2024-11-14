import fs from 'fs/promises';
import path from 'path';
import { VaultState } from './types';
import { logger } from '../logger';
import { AppError } from '../error';

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');
const MAX_BACKUPS = 10;

export class BackupService {
  private static async ensureBackupDirectory() {
    try {
      await fs.access(BACKUP_DIR);
    } catch {
      try {
        await fs.mkdir(BACKUP_DIR, { recursive: true, mode: 0o755 });
      } catch (error) {
        logger.error('Failed to create backup directory:', error);
        throw new AppError('Failed to create backup directory', 'DATABASE_ERROR');
      }
    }
  }

  static async createBackup(state: VaultState): Promise<void> {
    try {
      await this.ensureBackupDirectory();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(BACKUP_DIR, `vault-${timestamp}.json`);
      
      await fs.writeFile(
        backupFile,
        JSON.stringify(state, null, 2),
        { mode: 0o644 }
      );
      
      await this.cleanOldBackups();
      
      logger.info(`Backup created: ${backupFile}`);
    } catch (error) {
      logger.error('Failed to create backup:', error);
      throw new AppError('Backup creation failed', 'DATABASE_ERROR');
    }
  }

  private static async cleanOldBackups(): Promise<void> {
    try {
      const backups = await fs.readdir(BACKUP_DIR);
      if (backups.length <= MAX_BACKUPS) return;

      const sortedBackups = backups
        .filter(file => file.startsWith('vault-'))
        .sort();

      const backupsToDelete = sortedBackups.slice(0, sortedBackups.length - MAX_BACKUPS);
      
      await Promise.all(
        backupsToDelete.map(file => 
          fs.unlink(path.join(BACKUP_DIR, file))
        )
      );

      logger.info(`Cleaned up ${backupsToDelete.length} old backups`);
    } catch (error) {
      logger.error('Failed to clean old backups:', error);
    }
  }

  static async restoreLatestBackup(): Promise<VaultState | null> {
    try {
      await this.ensureBackupDirectory();
      
      const backups = await fs.readdir(BACKUP_DIR);
      if (backups.length === 0) return null;

      const latestBackup = backups
        .filter(file => file.startsWith('vault-'))
        .sort()
        .pop();

      if (!latestBackup) return null;

      const backupPath = path.join(BACKUP_DIR, latestBackup);
      const data = await fs.readFile(backupPath, 'utf-8');
      
      logger.info(`Restored backup: ${backupPath}`);
      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to restore backup:', error);
      return null;
    }
  }
}