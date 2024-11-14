"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface TypingIndicatorProps {
  typingUsers: Set<string>;
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  const count = typingUsers.size;
  if (count === 0) return null;

  const text = count === 1
    ? `${Array.from(typingUsers)[0]} is typing...`
    : count === 2
    ? `${Array.from(typingUsers).join(' and ')} are typing...`
    : `${count} people are typing...`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{text}</span>
      </motion.div>
    </AnimatePresence>
  );
}