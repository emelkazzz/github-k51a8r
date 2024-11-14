"use client";

import { useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher/client';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';

export const useSoundEffects = () => {
  const coinSound = useRef<HTMLAudioElement | null>(null);
  const winnerSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio elements
    coinSound.current = new Audio('/sounds/coin.mp3');
    winnerSound.current = new Audio('/sounds/winner.mp3');

    // Subscribe to Pusher channel
    const channel = pusherClient.subscribe(CHANNELS.VAULT);

    const handleNewParticipant = () => {
      coinSound.current?.play().catch(console.error);
    };

    const handleWinnerSelected = () => {
      winnerSound.current?.play().catch(console.error);
    };

    // Bind to Pusher events
    channel.bind(EVENTS.VAULT.NEW_PARTICIPANT, handleNewParticipant);
    channel.bind(EVENTS.VAULT.WINNER_SELECTED, handleWinnerSelected);

    // Cleanup
    return () => {
      channel.unbind(EVENTS.VAULT.NEW_PARTICIPANT, handleNewParticipant);
      channel.unbind(EVENTS.VAULT.WINNER_SELECTED, handleWinnerSelected);
      pusherClient.unsubscribe(CHANNELS.VAULT);
    };
  }, []);
};