"use client";

import { useCallback } from 'react';
import { usePresenceChannel } from './use-presence-channel';
import { CHANNELS } from '@/lib/pusher/constants';
import { toast } from 'sonner';
import type { PusherMember } from '@/lib/pusher/types';

export function useChatMembers(nickname: string) {
  const handleMemberJoined = useCallback((member: PusherMember) => {
    toast.success(`${member.info.nickname} joined the chat`);
  }, []);

  const handleMemberLeft = useCallback((member: PusherMember) => {
    toast.info(`${member.info.nickname} left the chat`);
  }, []);

  const { members, isSubscribed, error } = usePresenceChannel({
    channelName: CHANNELS.CHAT,
    userData: nickname, // Pass nickname as userData for auth
    onMemberJoined: handleMemberJoined,
    onMemberLeft: handleMemberLeft,
  });

  return {
    members,
    isSubscribed,
    error,
    onlineCount: members.size,
  };
}