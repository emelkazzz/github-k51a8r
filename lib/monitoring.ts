import { env } from './config';
import { logger } from './logger';
import { Store } from './db/store';
import { emailService } from './email/service';
import { StripeService } from './stripe/service';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    [key: string]: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
  };
}

export class Monitoring {
  private static lastCheck: HealthCheck | null = null;

  static async checkHealth(): Promise<HealthCheck> {
    const checks: HealthCheck['checks'] = {};
    let isHealthy = true;

    // Check database
    try {
      const start = Date.now();
      await Store.load();
      checks.database = {
        status: 'up',
        latency: Date.now() - start,
      };
    } catch (error) {
      isHealthy = false;
      checks.database = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Database check failed',
      };
    }

    // Check email service
    try {
      const start = Date.now();
      await emailService.verifyConnection();
      checks.email = {
        status: 'up',
        latency: Date.now() - start,
      };
    } catch (error) {
      isHealthy = false;
      checks.email = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Email check failed',
      };
    }

    // Check Stripe API
    try {
      const start = Date.now();
      await StripeService.checkConnection();
      checks.stripe = {
        status: 'up',
        latency: Date.now() - start,
      };
    } catch (error) {
      isHealthy = false;
      checks.stripe = {
        status: 'down',
        error: error instanceof Error ? error.message : 'Stripe check failed',
      };
    }

    const health: HealthCheck = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
    };

    this.lastCheck = health;

    if (!isHealthy) {
      logger.error('Health check failed', health);
    }

    return health;
  }

  static getLastCheck(): HealthCheck | null {
    return this.lastCheck;
  }

  static startMonitoring(intervalMs: number = 60000) {
    if (env.NODE_ENV === 'production') {
      setInterval(() => {
        this.checkHealth().catch(error => {
          logger.error('Monitoring check failed', error);
        });
      }, intervalMs);
      
      logger.info('Health monitoring started');
    }
  }
}