import { runMigrations } from '../db/migrations/index';
import { logger } from '../logger';
import { Monitoring } from '../monitoring';
import { CronService } from '../cron';

async function main() {
  try {
    // Run database migrations
    await runMigrations();
    logger.info('Database migrations completed');

    // Start monitoring
    Monitoring.startMonitoring();
    logger.info('Monitoring service started');

    // Initialize cron jobs
    CronService.initializeJobs();
    logger.info('Cron jobs initialized');

    logger.info('Server started successfully');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();