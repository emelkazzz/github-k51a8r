import { runMigrations } from '../lib/db/migrations';
import { CronService } from '../lib/cron';
import { logger } from '../lib/logger';
import { Monitoring } from '../lib/monitoring';

async function main() {
  try {
    // Run database migrations
    await runMigrations();
    logger.info('Database migrations completed');

    // Initialize cron jobs
    CronService.initializeJobs();
    logger.info('Cron jobs initialized');

    // Start monitoring
    Monitoring.startMonitoring();
    logger.info('Monitoring service started');

    logger.info('Server started successfully');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();