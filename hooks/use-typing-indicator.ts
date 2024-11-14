"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { pusherClient, setUserData } from '@/lib/pusher/client';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { debounce } from '@/lib/utils/debounce';
import { logger } from '@/lib/logger';
import type { PusherChannel } from '@/lib/pusher/types';

const TYPING_TIMEOUT = 2000;

export function useTypingIndicator(nickname: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const channelRef = useRef<PusherChannel | null>(null);
  const mounted = useRef(true);

  const clearTypingTimeout = useCallback((user: string) => {
    const timeout = timeoutsRef.current.get(user);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(user);
    }
  }, []);

  const handleTyping = useCallback((data: { user: string }) => {
    if (!mounted.current || data.user === nickname) return;

    setTypingUsers(prev => {
      const next = new Set(prev);
      next.add(data.user);
      return next;
    });
    
    clearTypingTimeout(data.user);
    
    const timeout = setTimeout(() => {
      if (!mounted.current) return;
      setTypingUsers(prev => {
        const next = new Set(prev);
        next.delete(data.user);
        return next;
      });
      timeoutsRef.current.delete(data.user);
    }, TYPING_TIMEOUT);
    
    timeoutsRef.current.set(data.user, timeout);
  }, [nickname, clearTypingTimeout]);

  const sendTypingNotification = useCallback(
    debounce(async () => {
      if (!nickname || !channelRef.current) return;

      try {
        const formData = new URLSearchParams();
        formData.append('nickname', nickname);
        formData.append('user_data', nickname); // Add user_data for auth

        await fetch('/api/chat/typing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });
      } catch (error) {
        logger.error('Failed to send typing notification:', error);
      }
    }, 500),
    [nickname]
  );

  useEffect(() => {
    mounted.current = true;

    const subscribeToChannel = async () => {
      if (!nickname) {
        logger.warn('Cannot subscribe to typing channel without nickname');
        return;
      }

      try {
        // Set user data for presence channel auth
        setUserData(nickname);

        // Subscribe to Pusher channel
        channelRef.current = pusherClient.subscribe(CHANNELS.CHAT) as PusherChannel;

        // Bind typing event handler
        channelRef.current.bind(EVENTS.CHAT.TYPING, handleTyping);

        // Handle subscription success
        channelRef.current.bind('pusher:subscription_succeeded', () => {
          logger.info('Successfully subscribed to typing channel');
        });

        // Handle subscription error
        channelRef.current.bind('pusher:subscription_error', (error: Error) => {
          logger.error('Failed to subscribe to typing channel:', error);
        });

        // Handle member removed events
        channelRef.current.bind('pusher:member_removed', (member: any) => {
          if (member.info?.nickname) {
            setTypingUsers(prev => {
              const next = new Set(prev);
              next.delete(member.info.nickname);
              return next;
            });
            clearTypingTimeout(member.info.nickname);
          }
        });

      } catch (error) {
        logger.error('Error setting up typing channel:', error);
      }
    };

    if (nickname) {
      subscribeToChannel();
    }

    return () => {
      mounted.current = false;

      // Clear all typing timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current.clear();

      // Cleanup channel subscription
      if (channelRef.current) {
        channelRef.current.unbind_all();
        pusherClient.unsubscribe(CHANNELS.CHAT);
        channelRef.current = null;
      }
    };
  }, [nickname, handleTyping, clearTypingTimeout]);

  return {
    typingUsers,
    sendTyping: sendTypingNotification,
  };
}