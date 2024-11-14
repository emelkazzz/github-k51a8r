"use client";

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher/client';
import { toast } from 'sonner';

interface UsePusherOptions {
  onConnectionStateChange?: (state: string) => void;
  onError?: (error: Error) => void;
  enableToasts?: boolean;
}

export function usePusher({
  onConnectionStateChange,
  onError,
  enableToasts = true,
}: UsePusherOptions = {}) {
  const [connectionState, setConnectionState] = useState(pusherClient.connection.state);

  useEffect(() => {
    function handleConnectionStateChange(state: string) {
      setConnectionState(state);
      onConnectionStateChange?.(state);

      if (enableToasts) {
        switch (state) {
          case 'connected':
            toast.success('Connected to server');
            break;
          case 'connecting':
            toast.loading('Connecting to server...');
            break;
          case 'disconnected':
            toast.error('Disconnected from server');
            break;
          case 'failed':
            toast.error('Connection failed');
            break;
        }
      }
    }

    function handleError(error: Error) {
      console.error('Pusher connection error:', error);
      onError?.(error);
      if (enableToasts) {
        toast.error(`Connection error: ${error.message}`);
      }
    }

    pusherClient.connection.bind('state_change', ({ current }: { current: string }) => {
      handleConnectionStateChange(current);
    });

    pusherClient.connection.bind('error', handleError);

    handleConnectionStateChange(pusherClient.connection.state);

    return () => {
      pusherClient.connection.unbind_all();
    };
  }, [onConnectionStateChange, onError, enableToasts]);

  return {
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    connectionState,
  };
}