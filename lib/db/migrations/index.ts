import { up as initialSchema } from './001_initial_schema';
import { logger } from '../../logger';

export async function runMigrations() {
  try {
    logger.info('Starting database migrations');
    await initialSchema();
    logger.info('Database migrations completed');
  } catch (error) {
    logger.error('Database migrations failed', error);
    throw error;
  }
}