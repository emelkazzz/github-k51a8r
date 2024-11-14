"use client";

import { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTypingIndicator } from '@/hooks/use-typing-indicator';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  nickname: string;
}

export function ChatInput({ onSend, disabled, nickname }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendTyping } = useTypingIndicator(nickname);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSend(message);
      setMessage('');
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  }, [message, disabled, isSubmitting, onSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    sendTyping();
  }, [sendTyping]);

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={handleChange}
          placeholder={disabled ? "Connecting..." : "Type a message..."}
          className="bg-gray-800 border-gray-700 text-white"
          maxLength={500}
          disabled={disabled || isSubmitting}
          aria-label="Chat message"
        />
        <Button 
          type="submit"
          variant="default"
          size="icon"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={disabled || !message.trim() || isSubmitting}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {message.length > 450 && (
        <p className="text-xs text-gray-400 mt-1">
          {500 - message.length} characters remaining
        </p>
      )}
    </form>
  );
}