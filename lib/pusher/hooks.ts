"use client";

import { useEffect, useState } from 'react';
import { pusherClient } from './client';
import { EVENTS } from './constants';
import { toast } from 'sonner';
import { logger } from '../logger';
import type { ConnectionState } from './types';

export function usePusherConnection() {
  const [connectionState, setConnectionState] = useState<string>(
    pusherClient.connection.state
  );

  useEffect(() => {
    function handleStateChange({ current, previous }: ConnectionState) {
      setConnectionState(current);
      
      switch (current) {
        case EVENTS.CONNECTION.CONNECTED:
          if (previous !== 'connecting') {
            toast.success('Connected to server');
          }
          break;
        case EVENTS.CONNECTION.DISCONNECTED:
          toast.error('Connection lost');
          break;
        case EVENTS.CONNECTION.FAILED:
          toast.error('Connection failed');
          break;
      }
    }

    function handleError(error: Error) {
      logger.error('Pusher connection error:', error);
      toast.error('Connection error');
    }

    pusherClient.connection.bind(EVENTS.CONNECTION.STATE_CHANGE, handleStateChange);
    pusherClient.connection.bind(EVENTS.CONNECTION.ERROR, handleError);

    return () => {
      pusherClient.connection.unbind(EVENTS.CONNECTION.STATE_CHANGE, handleStateChange);
      pusherClient.connection.unbind(EVENTS.CONNECTION.ERROR, handleError);
    };
  }, []);

  return {
    connectionState,
    isConnected: connectionState === EVENTS.CONNECTION.CONNECTED,
    isConnecting: connectionState === 'connecting',
  };
}