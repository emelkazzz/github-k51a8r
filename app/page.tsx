"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, Trophy, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ParticipateDialog } from '@/components/participate-dialog';
import { PrizePool } from '@/components/prize-pool';
import { Countdown } from '@/components/countdown';
import { LiveFeed } from '@/components/live-feed';
import { WinnerAnnouncement } from '@/components/winner-announcement';
import { ChatWindow } from '@/components/chat/chat-window';
import { useSoundEffects } from '@/hooks/use-sound-effects';
import { useVault } from '@/hooks/use-vault';
import Link from 'next/link';

export default function Home() {
  const [isParticipateOpen, setIsParticipateOpen] = useState(false);
  const { winner, isActive, previewWinner } = useVault();
  useSoundEffects();

  // Show winner landing page during closure period or preview
  if ((!isActive && winner) || previewWinner) {
    const displayWinner = previewWinner || winner;
    
    if (!displayWinner) return null;

    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-600 via-purple-600 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-8 animate-bounce" />
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              We Have a Winner!
            </h1>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <p className="text-2xl text-blue-100 mb-4">
                Congratulations to
              </p>
              <p className="text-4xl font-bold text-white mb-8">
                {displayWinner.nickname}
              </p>
              <div className="bg-black/20 rounded-lg p-6 mb-8">
                <p className="text-xl text-blue-100 mb-2">Prize Amount:</p>
                <p className="text-5xl font-bold text-white">
                  €{displayWinner.amount.toLocaleString()}
                </p>
              </div>
              <p className="text-lg text-blue-100">
                The next round starts Monday at 10:00. Don't miss your chance to win!
              </p>
              
              {displayWinner.message && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="mt-4 bg-blue-500/20 rounded-lg p-4 flex items-center justify-center gap-2"
                >
                  <p className="text-blue-100 text-sm">
                    {displayWinner.message}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-950 via-purple-900 to-blue-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-end mb-4">
          <Link href="/admin/login">
            <Button variant="ghost" className="text-blue-200 hover:text-white hover:bg-blue-900/50">
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            The Vault
          </h1>
          <p className="text-xl text-blue-200">
            Enter for €10, Win Big Every Week!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <PrizePool />
            <Countdown />
            <Button
              size="lg"
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setIsParticipateOpen(true)}
              disabled={!isActive}
            >
              <Coins className="mr-2 h-5 w-5" />
              Participate for €10
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white flex items-center">
                <Trophy className="mr-2 h-6 w-6" />
                Live Feed
              </h2>
            </div>
            <LiveFeed />
          </motion.div>
        </div>
      </div>

      <ParticipateDialog
        open={isParticipateOpen}
        onOpenChange={setIsParticipateOpen}
      />
      <WinnerAnnouncement />
      <ChatWindow />
    </main>
  );
}