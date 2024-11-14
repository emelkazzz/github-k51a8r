"use client";

import PusherClient from 'pusher-js';
import { PUSHER_CONFIG } from './config';
import { logger } from '../logger';
import type { PusherChannel, PusherConfig } from './types';

if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
  throw new Error('NEXT_PUBLIC_PUSHER_KEY is not configured');
}

if (!process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
  throw new Error('NEXT_PUBLIC_PUSHER_CLUSTER is not configured');
}

const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY;
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

class PusherClientManager {
  private static instance: PusherClient | null = null;
  private static userData: string | null = null;

  static getInstance(): PusherClient {
    if (!this.instance) {
      this.instance = this.createInstance();
    }
    return this.instance;
  }

  private static createInstance(): PusherClient {
    PusherClient.logToConsole = process.env.NODE_ENV === 'development';

    const config: PusherConfig = {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        params: this.userData ? { user_data: this.userData } : undefined
      },
      enableStats: false,
      activityTimeout: PUSHER_CONFIG.DEFAULTS.ACTIVITY_TIMEOUT,
      pongTimeout: PUSHER_CONFIG.DEFAULTS.PONG_TIMEOUT,
      wsHost: undefined,
      wsPort: undefined,
      wssPort: undefined,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    };

    return new PusherClient(PUSHER_KEY, config);
  }

  static setUserData(userData: string): void {
    if (!userData) {
      logger.error('Attempted to set empty user data');
      return;
    }

    this.userData = userData;
    if (this.instance) {
      this.instance.config.auth = {
        ...this.instance.config.auth,
        params: { user_data: userData }
      };
    }
  }

  static async reconnect(): Promise<void> {
    try {
      if (this.instance) {
        this.instance.disconnect();
      }
      this.instance = this.createInstance();
      await this.instance.connect();
      logger.info('Pusher reconnected successfully');
    } catch (error) {
      logger.error('Reconnection failed:', error);
      throw error;
    }
  }

  static disconnect(): void {
    if (this.instance) {
      this.instance.disconnect();
      this.instance = null;
      this.userData = null;
      logger.info('Pusher disconnected');
    }
  }

  static getConnectionState(): string {
    return this.instance?.connection.state || 'disconnected';
  }

  static isConnected(): boolean {
    return this.instance?.connection.state === PUSHER_CONFIG.EVENTS.CONNECTION.CONNECTED;
  }
}

export const pusherClient = PusherClientManager.getInstance();
export const setUserData = PusherClientManager.setUserData.bind(PusherClientManager);
export const reconnectPusher = PusherClientManager.reconnect.bind(PusherClientManager);
export const disconnectPusher = PusherClientManager.disconnect.bind(PusherClientManager);
export const getConnectionState = PusherClientManager.getConnectionState.bind(PusherClientManager);
export const isConnected = PusherClientManager.isConnected.bind(PusherClientManager);