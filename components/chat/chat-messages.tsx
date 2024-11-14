"use client";

import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  nickname: string;
}

export function ChatMessages({ messages, nickname }: ChatMessagesProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollAreaRef.current || !shouldAutoScroll.current) return;
    
    const scrollArea = scrollAreaRef.current;
    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    shouldAutoScroll.current = distanceFromBottom < 100;
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return (
    <ScrollArea 
      className="flex-1 p-4" 
      ref={scrollAreaRef}
      onScroll={handleScroll}
    >
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.nickname}-${message.timestamp}-${index}`}
            message={message}
            isOwn={message.nickname === nickname}
          />
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
}