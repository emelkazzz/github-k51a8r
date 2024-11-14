import { runMigrations } from '../lib/db/migrations';
import { logger } from '../lib/logger';

async function setup() {
  try {
    logger.info('Starting database setup...');
    await runMigrations();
    logger.info('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database setup failed:', error);
    process.exit(1);
  }
}

setup();