"use client";

import { PUSHER_CONFIG } from './config';
import { logger } from '../logger';
import type PusherClient from 'pusher-js';

export class ConnectionManager {
  private static instance: ConnectionManager;
  private connectionAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private subscriptions = new Set<string>();
  private connectionPromise: Promise<void> | null = null;
  private connectionResolver: (() => void) | null = null;

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!this.instance) {
      this.instance = new ConnectionManager();
    }
    return this.instance;
  }

  private calculateBackoff(): number {
    const jitter = Math.random() * 1000;
    return Math.min(
      PUSHER_CONFIG.DEFAULTS.RECONNECT_MIN_DELAY * Math.pow(2, this.connectionAttempts) + jitter,
      PUSHER_CONFIG.DEFAULTS.RECONNECT_MAX_DELAY
    );
  }

  private clearTimeouts(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  async connect(pusher: PusherClient): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve) => {
      this.connectionResolver = resolve;
      this.attemptConnection(pusher);
    });

    return this.connectionPromise;
  }

  private async attemptConnection(pusher: PusherClient): Promise<void> {
    if (pusher.connection.state === PUSHER_CONFIG.EVENTS.CONNECTION.CONNECTED) {
      this.handleConnectionSuccess(pusher);
      return;
    }

    try {
      this.connectionAttempts++;
      logger.info(`Connection attempt ${this.connectionAttempts}/${PUSHER_CONFIG.DEFAULTS.MAX_RETRIES}`);

      const connectionPromise = new Promise<void>((resolve, reject) => {
        const handleConnectionState = ({ current }: { current: string }) => {
          if (current === PUSHER_CONFIG.EVENTS.CONNECTION.CONNECTED) {
            pusher.connection.unbind('state_change', handleConnectionState);
            resolve();
          } else if (current === PUSHER_CONFIG.EVENTS.CONNECTION.FAILED || 
                     current === PUSHER_CONFIG.EVENTS.CONNECTION.DISCONNECTED) {
            pusher.connection.unbind('state_change', handleConnectionState);
            reject(new Error(`Connection ${current}`));
          }
        };

        pusher.connection.bind('state_change', handleConnectionState);
      });

      await connectionPromise;
      this.handleConnectionSuccess(pusher);
    } catch (error) {
      if (this.connectionAttempts < PUSHER_CONFIG.DEFAULTS.MAX_RETRIES) {
        const delay = this.calculateBackoff();
        logger.info(`Retrying connection in ${delay}ms`);
        
        this.reconnectTimeout = setTimeout(() => {
          this.attemptConnection(pusher);
        }, delay);
      } else {
        logger.error('Max connection attempts reached');
        this.handleConnectionFailure();
      }
    }
  }

  private handleConnectionSuccess(pusher: PusherClient): void {
    this.connectionAttempts = 0;
    this.setupHealthCheck(pusher);
    this.resubscribeToChannels(pusher);
    
    if (this.connectionResolver) {
      this.connectionResolver();
      this.connectionResolver = null;
      this.connectionPromise = null;
    }

    logger.info('Connection established successfully');
  }

  private setupHealthCheck(pusher: PusherClient): void {
    this.clearTimeouts();

    this.healthCheckInterval = setInterval(() => {
      if (pusher.connection.state !== PUSHER_CONFIG.EVENTS.CONNECTION.CONNECTED) {
        logger.info('Connection lost, attempting to reconnect');
        this.attemptConnection(pusher);
      }
    }, PUSHER_CONFIG.DEFAULTS.ACTIVITY_TIMEOUT);
  }

  private handleConnectionFailure(): void {
    this.clearTimeouts();
    this.subscriptions.clear();
    if (this.connectionResolver) {
      this.connectionResolver();
      this.connectionResolver = null;
      this.connectionPromise = null;
    }
  }

  private async resubscribeToChannels(pusher: PusherClient): Promise<void> {
    for (const channelName of this.subscriptions) {
      try {
        await pusher.subscribe(channelName);
        logger.info(`Resubscribed to channel: ${channelName}`);
      } catch (error) {
        logger.error(`Failed to resubscribe to channel ${channelName}:`, error);
      }
    }
  }

  addSubscription(channelName: string): void {
    this.subscriptions.add(channelName);
  }

  removeSubscription(channelName: string): void {
    this.subscriptions.delete(channelName);
  }

  disconnect(): void {
    this.clearTimeouts();
    this.subscriptions.clear();
    this.connectionAttempts = 0;
    this.connectionPromise = null;
    this.connectionResolver = null;
  }
}