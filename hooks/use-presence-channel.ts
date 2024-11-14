"use client";

import { useState, useCallback } from 'react';
import { pusherClient, setUserData } from '@/lib/pusher/client';
import { CHANNELS } from '@/lib/pusher/constants';
import type { PusherMember } from '@/lib/pusher/types';

interface UsePresenceChannelOptions {
  channelName: string;
  userData?: any;
  onMemberJoined?: (member: PusherMember) => void;
  onMemberLeft?: (member: PusherMember) => void;
}

export function usePresenceChannel({
  channelName,
  userData,
  onMemberJoined,
  onMemberLeft,
}: UsePresenceChannelOptions) {
  const [members, setMembers] = useState<Map<string, PusherMember>>(new Map());
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSubscriptionSuccess = useCallback((data: any) => {
    setMembers(new Map(Object.entries(data.members || {})));
    setIsSubscribed(true);
    setError(null);
  }, []);

  const handleSubscriptionError = useCallback((err: Error) => {
    setError(err);
    setIsSubscribed(false);
  }, []);

  const handleMemberAdded = useCallback((member: PusherMember) => {
    setMembers(prev => new Map(prev).set(member.id, member));
    onMemberJoined?.(member);
  }, [onMemberJoined]);

  const handleMemberRemoved = useCallback((member: PusherMember) => {
    setMembers(prev => {
      const updated = new Map(prev);
      updated.delete(member.id);
      return updated;
    });
    onMemberLeft?.(member);
  }, [onMemberLeft]);

  const subscribe = useCallback(() => {
    if (!userData) return;

    try {
      // Set user data for presence channel auth
      setUserData(userData);

      const channel = pusherClient.subscribe(channelName);

      channel.bind('pusher:subscription_succeeded', handleSubscriptionSuccess);
      channel.bind('pusher:subscription_error', handleSubscriptionError);
      channel.bind('pusher:member_added', handleMemberAdded);
      channel.bind('pusher:member_removed', handleMemberRemoved);

      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(channelName);
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe'));
      setIsSubscribed(false);
    }
  }, [channelName, userData, handleSubscriptionSuccess, handleSubscriptionError, handleMemberAdded, handleMemberRemoved]);

  useEffect(() => {
    const cleanup = subscribe();
    return () => cleanup?.();
  }, [subscribe]);

  return {
    members,
    isSubscribed,
    error,
  };
}