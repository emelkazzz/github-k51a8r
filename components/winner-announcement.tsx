"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock } from 'lucide-react';
import { pusherClient } from '@/lib/pusher/client';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import confetti from 'canvas-confetti';

interface Winner {
  nickname: string;
  amount: number;
  message?: string;
}

export function WinnerAnnouncement() {
  const [winner, setWinner] = useState<Winner | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const channel = pusherClient.subscribe(CHANNELS.VAULT);

    const handleWinnerSelected = (winnerData: Winner) => {
      setWinner(winnerData);
      setVisible(true);
      
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500'],
      });

      // Hide announcement after 10 seconds
      setTimeout(() => {
        setVisible(false);
      }, 10000);
    };

    channel.bind(EVENTS.VAULT.WINNER_SELECTED, handleWinnerSelected);

    return () => {
      channel.unbind(EVENTS.VAULT.WINNER_SELECTED, handleWinnerSelected);
      pusherClient.unsubscribe(CHANNELS.VAULT);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", damping: 15 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm"
        >
          <div className="bg-gradient-to-b from-blue-600 to-purple-700 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
            <motion.h2 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white mb-4"
            >
              We Have a Winner!
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-blue-100 mb-2"
            >
              Congratulations to
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-bold text-white mb-4"
            >
              {winner.nickname}
            </motion.p>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-lg text-blue-100"
            >
              Prize Amount:
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: "spring" }}
              className="text-4xl font-bold text-white mb-4"
            >
              €{winner.amount.toLocaleString()}
            </motion.p>
            
            {winner.message && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-4 bg-blue-500/20 rounded-lg p-4 flex items-center justify-center gap-2"
              >
                <Clock className="h-5 w-5 text-blue-200" />
                <p className="text-blue-100 text-sm">
                  {winner.message}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}