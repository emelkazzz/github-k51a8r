"use client";

import { Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClose: () => void;
  onlineCount: number;
}

export function ChatHeader({ onClose, onlineCount }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Users className="h-4 w-4" />
          <span>{onlineCount} online</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="text-gray-400 hover:text-white"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
}