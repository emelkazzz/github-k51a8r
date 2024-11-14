"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { pusherClient, subscribeToChannel, unsubscribeFromChannel } from '@/lib/pusher/client';
import { logger } from '@/lib/logger';
import type { PusherChannel, PusherEvent } from '@/lib/pusher/types';

interface UsePusherChannelOptions {
  channelName: string;
  eventHandlers?: Record<string, (data: any) => void>;
  userData?: any;
  onMemberAdded?: (member: any) => void;
  onMemberRemoved?: (member: any) => void;
  onSubscriptionSucceeded?: (data: any) => void;
  onSubscriptionError?: (error: Error) => void;
}

export function usePusherChannel({
  channelName,
  eventHandlers = {},
  userData,
  onMemberAdded,
  onMemberRemoved,
  onSubscriptionSucceeded,
  onSubscriptionError,
}: UsePusherChannelOptions) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<PusherChannel | null>(null);
  const mounted = useRef(true);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      unsubscribeFromChannel(channelName);
      channelRef.current = null;
    }
  }, [channelName]);

  const setupChannel = useCallback(() => {
    try {
      cleanup();
      channelRef.current = subscribeToChannel(channelName, userData);

      // Bind presence channel events if applicable
      if (channelName.startsWith('presence-')) {
        channelRef.current.bind('pusher:subscription_succeeded', (data: any) => {
          if (!mounted.current) return;
          setIsSubscribed(true);
          setError(null);
          onSubscriptionSucceeded?.(data);
        });

        channelRef.current.bind('pusher:subscription_error', (error: Error) => {
          if (!mounted.current) return;
          setError(error);
          onSubscriptionError?.(error);
        });

        if (onMemberAdded) {
          channelRef.current.bind('pusher:member_added', onMemberAdded);
        }

        if (onMemberRemoved) {
          channelRef.current.bind('pusher:member_removed', onMemberRemoved);
        }
      }

      // Bind custom event handlers
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        channelRef.current?.bind(event, handler);
      });

      logger.info(`Subscribed to channel: ${channelName}`);
    } catch (error) {
      logger.error(`Failed to setup channel ${channelName}:`, error);
      setError(error instanceof Error ? error : new Error('Channel setup failed'));
    }
  }, [
    channelName,
    userData,
    cleanup,
    eventHandlers,
    onMemberAdded,
    onMemberRemoved,
    onSubscriptionSucceeded,
    onSubscriptionError,
  ]);

  useEffect(() => {
    mounted.current = true;

    if (pusherClient.connection.state === 'connected') {
      setupChannel();
    }

    const handleConnectionStateChange = (states: { current: string }) => {
      if (states.current === 'connected') {
        setupChannel();
      } else if (states.current === 'disconnected') {
        setIsSubscribed(false);
      }
    };

    pusherClient.connection.bind('state_change', handleConnectionStateChange);

    return () => {
      mounted.current = false;
      cleanup();
      pusherClient.connection.unbind('state_change', handleConnectionStateChange);
    };
  }, [setupChannel, cleanup]);

  const trigger = useCallback((eventName: string, data: any) => {
    if (!channelRef.current || !isSubscribed) {
      throw new Error('Cannot trigger event: channel not subscribed');
    }
    channelRef.current.trigger(eventName, data);
  }, [isSubscribed]);

  return {
    isSubscribed,
    error,
    trigger,
    channel: channelRef.current,
  };
}