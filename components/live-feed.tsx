"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { useVault } from '@/hooks/use-vault';

export function LiveFeed() {
  const { participants } = useVault();

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto">
      <AnimatePresence>
        {participants.map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-black/40 rounded-lg p-4 flex items-center"
          >
            <div className="bg-blue-600 rounded-full p-2 mr-4">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-white">{entry.nickname}</div>
              <div className="text-sm text-blue-200">
                {new Date(entry.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}