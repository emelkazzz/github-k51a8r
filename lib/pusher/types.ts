import type { Channel, PresenceChannel } from 'pusher-js';

export interface PusherMember {
  id: string;
  info: {
    nickname: string;
    joinedAt: string;
  };
}

export type PusherChannel = Channel & {
  members?: Map<string, PusherMember>;
  bind: (event: string, callback: (data: any) => void) => void;
  unbind: (event?: string) => void;
  unbind_all: () => void;
  trigger: (event: string, data: any) => void;
};

export interface ConnectionState {
  current: string;
  previous: string;
}

export interface PusherError extends Error {
  type?: string;
  data?: any;
}

export interface ChannelAuthResponse {
  auth: string;
  channel_data?: string;
}

export interface PusherEvent {
  channel: string;
  event: string;
  data: any;
}

export interface PusherConfig {
  cluster: string;
  forceTLS: boolean;
  authEndpoint: string;
  auth: {
    headers: Record<string, string>;
    params?: Record<string, string>;
  };
  enableStats: boolean;
  activityTimeout: number;
  pongTimeout: number;
  wsHost?: string;
  wsPort?: number;
  wssPort?: number;
  disableStats: boolean;
  enabledTransports: ('ws' | 'wss')[];
}