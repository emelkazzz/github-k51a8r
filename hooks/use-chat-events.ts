"use client";

import { useCallback } from 'react';
import { usePusherChannel } from './use-pusher-channel';
import { PUSHER_CONFIG } from '@/lib/pusher/config';
import { toast } from 'sonner';
import type { ChatMessage } from '@/lib/types';

interface UseChatEventsOptions {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (user: string) => void;
  onError?: (error: Error) => void;
}

export function useChatEvents({
  onMessage,
  onTyping,
  onError,
}: UseChatEventsOptions = {}) {
  const handleMessage = useCallback((message: ChatMessage) => {
    onMessage?.(message);
  }, [onMessage]);

  const handleTyping = useCallback((data: { user: string }) => {
    onTyping?.(data.user);
  }, [onTyping]);

  const handleError = useCallback((error: Error) => {
    onError?.(error);
    toast.error('Chat error: ' + error.message);
  }, [onError]);

  const { isSubscribed, error, trigger } = usePusherChannel({
    channelName: PUSHER_CONFIG.CHANNELS.CHAT,
    eventHandlers: {
      [PUSHER_CONFIG.EVENTS.CHAT.MESSAGE]: handleMessage,
      [PUSHER_CONFIG.EVENTS.CHAT.TYPING]: handleTyping,
      [PUSHER_CONFIG.EVENTS.CHAT.ERROR]: handleError,
    },
  });

  return {
    isSubscribed,
    error,
    trigger,
  };
}