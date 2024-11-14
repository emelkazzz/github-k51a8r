"use client";

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwn: boolean;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message, isOwn }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-gray-400">{message.nickname}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
          </span>
        </div>
        <div
          className={`max-w-[80%] rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-100'
          }`}
        >
          {message.content}
        </div>
      </motion.div>
    );
  }
);