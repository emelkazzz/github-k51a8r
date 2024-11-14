"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { pusherClient, setUserData } from '@/lib/pusher/client';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import Cookies from 'js-cookie';
import type { ChatMessage } from '@/lib/types';
import type { PusherChannel } from '@/lib/pusher/types';

const NICKNAME_COOKIE = 'chat_nickname';
const MAX_RETRIES = 3;

export function useChat() {
  const [nickname, setNickname] = useState<string>(() => Cookies.get(NICKNAME_COOKIE) || '');
  const [error, setError] = useState<Error | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<PusherChannel | null>(null);
  const mounted = useRef(true);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unbind_all();
      pusherClient.unsubscribe(CHANNELS.CHAT);
      channelRef.current = null;
    }
  }, []);

  const loadChatHistory = useCallback(async () => {
    try {
      const response = await fetch('/api/chat/history');
      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }
      const data = await response.json();
      if (mounted.current && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (error) {
      logger.error('Failed to load chat history:', error);
      if (mounted.current) {
        toast.error('Failed to load chat history');
      }
    }
  }, []);

  const setupChannel = useCallback(async (retryCount = 0) => {
    if (!nickname) return;

    try {
      cleanup();

      // Set user data for presence channel
      setUserData(nickname);

      // Subscribe to channel
      channelRef.current = pusherClient.subscribe(CHANNELS.CHAT) as PusherChannel;

      // Handle subscription success
      channelRef.current.bind('pusher:subscription_succeeded', (members: any) => {
        if (!mounted.current) return;
        setMembers(members.members || {});
        setIsLoading(false);
        setError(null);
        setIsConnected(true);
        loadChatHistory();
      });

      // Handle subscription error
      channelRef.current.bind('pusher:subscription_error', (error: any) => {
        logger.error('Chat subscription error:', error);
        if (!mounted.current) return;
        
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => setupChannel(retryCount + 1), 1000);
        } else {
          setError(new Error('Failed to join chat. Please try again.'));
          setIsLoading(false);
          setIsConnected(false);
          cleanup();
        }
      });

      // Handle chat messages
      channelRef.current.bind(EVENTS.CHAT.MESSAGE, (message: ChatMessage) => {
        if (!mounted.current) return;
        setMessages(prev => [...prev, message]);
      });

      // Handle member events
      channelRef.current.bind('pusher:member_added', (member: any) => {
        if (!mounted.current) return;
        setMembers(prev => ({ ...prev, [member.id]: member.info }));
        toast.success(`${member.info.nickname} joined the chat`);
      });

      channelRef.current.bind('pusher:member_removed', (member: any) => {
        if (!mounted.current) return;
        setMembers(prev => {
          const updated = { ...prev };
          delete updated[member.id];
          return updated;
        });
        toast.info(`${member.info.nickname} left the chat`);
      });

    } catch (error) {
      logger.error('Failed to setup chat channel:', error);
      if (mounted.current) {
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => setupChannel(retryCount + 1), 1000);
        } else {
          setError(error instanceof Error ? error : new Error('Failed to setup chat'));
          setIsLoading(false);
          setIsConnected(false);
          cleanup();
        }
      }
    }
  }, [nickname, loadChatHistory, cleanup]);

  const sendMessage = useCallback(async (content: string) => {
    if (!nickname || !content.trim()) {
      throw new Error('Cannot send message: missing content or nickname');
    }

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname,
          content: content.trim(),
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setError(null);
    } catch (error) {
      logger.error('Failed to send message:', error);
      throw error;
    }
  }, [nickname]);

  const setValidatedNickname = useCallback(async (newNickname: string) => {
    try {
      if (newNickname.length < 2) {
        throw new Error('Nickname must be at least 2 characters');
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(newNickname)) {
        throw new Error('Invalid nickname format');
      }

      if (Object.values(members).some(
        (member: any) => member.nickname?.toLowerCase() === newNickname.toLowerCase()
      )) {
        throw new Error('This nickname is already taken');
      }

      // Save nickname to cookie
      Cookies.set(NICKNAME_COOKIE, newNickname, { expires: 7 });
      setNickname(newNickname);

      // Initialize chat connection
      await setupChannel();

      toast.success('Successfully joined chat!');
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        throw error;
      }
      throw new Error('Invalid nickname');
    }
  }, [members, setupChannel]);

  useEffect(() => {
    mounted.current = true;

    if (nickname) {
      setupChannel();
    }

    return () => {
      mounted.current = false;
      cleanup();
    };
  }, [nickname, setupChannel, cleanup]);

  return {
    messages,
    isLoading,
    isConnected,
    nickname,
    setNickname: setValidatedNickname,
    sendMessage,
    members,
    error,
  };
}