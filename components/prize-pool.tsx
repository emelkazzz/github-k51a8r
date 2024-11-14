"use client";

import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useVault } from '@/hooks/use-vault';

export function PrizePool() {
  const { prizeAmount, totalParticipants } = useVault();

  return (
    <div>
      <h2 className="text-xl font-semibold text-white flex items-center mb-4">
        <TrendingUp className="mr-2 h-5 w-5" />
        Current Prize Pool
      </h2>
      <motion.div
        className="bg-black/40 rounded-lg p-6 text-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="text-5xl font-bold text-white mb-2">
          €{prizeAmount.toLocaleString()}
        </div>
        <div className="text-blue-200">
          {totalParticipants} Participants
        </div>
      </motion.div>
    </div>
  );
}