import fs from 'fs/promises';
import path from 'path';
import { logger } from '../../logger';

const DB_PATH = path.join(process.cwd(), 'data');
const VAULT_FILE = path.join(DB_PATH, 'vault.json');

export async function up() {
  try {
    await fs.mkdir(DB_PATH, { recursive: true });
    await fs.mkdir(path.join(DB_PATH, 'backups'), { recursive: true });

    const initialSchema = {
      prizeAmount: 0,
      participants: [],
      totalParticipants: 0,
      winner: null,
      chatHistory: [],
    };

    await fs.writeFile(
      VAULT_FILE,
      JSON.stringify(initialSchema, null, 2)
    );

    logger.info('Initial schema migration completed');
  } catch (error) {
    logger.error('Failed to run initial schema migration', error);
    throw error;
  }
}