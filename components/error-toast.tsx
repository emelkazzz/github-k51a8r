"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import { pusherClient } from '@/lib/pusher/client';
import { AppError } from '@/lib/error';
import { logger } from '@/lib/logger';

export function ErrorToast() {
  useEffect(() => {
    const handleConnectionStateChange = (state: string) => {
      switch (state) {
        case 'connecting':
          toast.loading('Connecting to server...');
          break;
        case 'disconnected':
          toast.error('Connection lost', {
            description: 'Attempting to reconnect...',
          });
          break;
        case 'failed':
          toast.error('Connection failed', {
            description: 'Please check your internet connection and refresh the page.',
          });
          break;
      }
    };

    // Subscribe to Pusher connection state changes
    pusherClient.connection.bind('state_change', ({ current }: { current: string }) => {
      handleConnectionStateChange(current);
    });

    // Subscribe to error events
    pusherClient.connection.bind('error', (error: Error) => {
      logger.error('Pusher connection error:', error);
      toast.error('Connection error', {
        description: 'Please check your internet connection.',
      });
    });

    return () => {
      pusherClient.connection.unbind_all();
    };
  }, []);

  return null;
}