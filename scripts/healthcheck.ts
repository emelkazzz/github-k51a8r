import { Monitoring } from '../lib/monitoring';

async function check() {
  try {
    const health = await Monitoring.checkHealth();
    
    if (health.status === 'healthy') {
      console.log('Health check passed:', health);
      process.exit(0);
    } else {
      console.error('Health check failed:', health);
      process.exit(1);
    }
  } catch (error) {
    console.error('Health check error:', error);
    process.exit(1);
  }
}

check();