"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { pusherClient } from '@/lib/pusher/client';
import { PUSHER_CONFIG } from '@/lib/pusher/config';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export function useChatConnection() {
  const [connectionState, setConnectionState] = useState(pusherClient.connection.state);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const mounted = useRef(true);

  const handleReconnect = useCallback(async () => {
    if (isReconnecting || !mounted.current) return;

    try {
      setIsReconnecting(true);
      await pusherClient.connect();
      if (mounted.current) {
        setConnectionState('connected');
        toast.success('Connected to chat');
      }
    } catch (error) {
      logger.error('Failed to reconnect:', error);
      if (mounted.current) {
        toast.error('Failed to reconnect. Please try again.');
      }
    } finally {
      if (mounted.current) {
        setIsReconnecting(false);
      }
    }
  }, [isReconnecting]);

  useEffect(() => {
    mounted.current = true;

    const handleConnectionState = ({ current }: { current: string }) => {
      if (!mounted.current) return;
      
      setConnectionState(current);

      switch (current) {
        case PUSHER_CONFIG.EVENTS.CONNECTION.CONNECTED:
          toast.success('Connected to chat');
          break;
        case PUSHER_CONFIG.EVENTS.CONNECTION.DISCONNECTED:
          toast.error('Disconnected from chat');
          handleReconnect();
          break;
        case PUSHER_CONFIG.EVENTS.CONNECTION.FAILED:
          toast.error('Connection failed');
          break;
      }
    };

    const handleError = (error: Error) => {
      if (!mounted.current) return;
      logger.error('Chat connection error:', error);
      toast.error('Connection error. Please try reconnecting.');
    };

    pusherClient.connection.bind(PUSHER_CONFIG.EVENTS.CONNECTION.STATE_CHANGE, handleConnectionState);
    pusherClient.connection.bind(PUSHER_CONFIG.EVENTS.CONNECTION.ERROR, handleError);

    return () => {
      mounted.current = false;
      pusherClient.connection.unbind(PUSHER_CONFIG.EVENTS.CONNECTION.STATE_CHANGE, handleConnectionState);
      pusherClient.connection.unbind(PUSHER_CONFIG.EVENTS.CONNECTION.ERROR, handleError);
    };
  }, [handleReconnect]);

  return {
    isConnected: connectionState === PUSHER_CONFIG.EVENTS.CONNECTION.CONNECTED,
    isConnecting: connectionState === 'connecting' || isReconnecting,
    connectionState,
    reconnect: handleReconnect,
  };
}