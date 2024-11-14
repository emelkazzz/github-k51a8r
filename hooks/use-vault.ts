"use client";

import { useState, useEffect } from 'react';
import { pusherClient } from '@/lib/pusher/client';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export type Participant = {
  id: string;
  nickname: string;
  timestamp: Date;
};

export type Winner = {
  nickname: string;
  amount: number;
  message?: string;
};

export type VaultState = {
  prizeAmount: number;
  participants: Participant[];
  totalParticipants: number;
  isActive: boolean;
  winner: Winner | null;
  previewWinner: Winner | null;
};

const INITIAL_STATE: VaultState = {
  prizeAmount: 0,
  participants: [],
  totalParticipants: 0,
  isActive: true,
  winner: null,
  previewWinner: null,
};

export const useVault = () => {
  const [vaultState, setVaultState] = useState<VaultState>(INITIAL_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Load initial state
    const loadState = async () => {
      try {
        const response = await fetch('/api/vault/state');
        if (!response.ok) {
          throw new Error('Failed to load vault state');
        }
        
        const data = await response.json();
        
        if (mounted) {
          setVaultState(data);
        }
      } catch (error) {
        logger.error('Failed to load vault state:', error);
        toast.error('Failed to load vault state');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadState();

    // Subscribe to Pusher channel
    const channel = pusherClient.subscribe(CHANNELS.VAULT);

    channel.bind(EVENTS.VAULT.NEW_PARTICIPANT, (participant: Participant) => {
      setVaultState((prev) => ({
        ...prev,
        participants: [participant, ...prev.participants].slice(0, 50),
        totalParticipants: prev.totalParticipants + 1,
        prizeAmount: prev.prizeAmount + 10,
      }));

      // Play sound effect
      new Audio('/sounds/coin.mp3').play().catch(console.error);
    });

    channel.bind(EVENTS.VAULT.STATUS_UPDATE, (data: { 
      isActive: boolean;
      message?: string;
      isPreview?: boolean;
      previewWinner?: Winner | null;
      winner?: Winner | null;
      prizeAmount?: number;
      totalParticipants?: number;
    }) => {
      setVaultState((prev) => ({
        ...prev,
        isActive: data.isActive,
        previewWinner: data.previewWinner || null,
        winner: data.winner !== undefined ? data.winner : prev.winner,
        prizeAmount: data.prizeAmount !== undefined ? data.prizeAmount : prev.prizeAmount,
        totalParticipants: data.totalParticipants !== undefined ? data.totalParticipants : prev.totalParticipants,
      }));

      if (data.message) {
        toast.info(data.message);
      }
    });

    channel.bind(EVENTS.VAULT.WINNER_SELECTED, (data: Winner) => {
      setVaultState(prev => ({
        ...prev,
        winner: data,
      }));

      toast.success(
        `Congratulations to ${data.nickname}!`,
        {
          description: `They won €${data.amount.toLocaleString()}!`,
          duration: 10000,
        }
      );

      // Play winner sound effect
      new Audio('/sounds/winner.mp3').play().catch(console.error);
    });

    return () => {
      mounted = false;
      channel.unbind_all();
      pusherClient.unsubscribe(CHANNELS.VAULT);
    };
  }, []);

  return {
    ...vaultState,
    isLoading,
  };
};