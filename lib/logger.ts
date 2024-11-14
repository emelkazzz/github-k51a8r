import { formatCurrency } from './utils';

type LogLevel = 'info' | 'warn' | 'error';

class Logger {
  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (data) {
      console[level](logMessage, data);
    } else {
      console[level](logMessage);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, error?: any) {
    this.log('error', message, error);
  }

  participantJoined(nickname: string, amount: number) {
    this.info(`New participant joined: ${nickname}, Prize pool: ${formatCurrency(amount)}`);
  }

  winnerSelected(nickname: string, amount: number) {
    this.info(`Winner selected: ${nickname}, Prize amount: ${formatCurrency(amount)}`);
  }

  paymentFailed(error: string) {
    this.error(`Payment processing failed: ${error}`);
  }

  emailSent(type: 'participation' | 'winner', email: string) {
    this.info(`${type} email sent to: ${email}`);
  }

  emailError(type: string, error: any) {
    this.error(`Failed to send ${type} email`, error);
  }
}

export const logger = new Logger();