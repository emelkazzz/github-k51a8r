"use client";

import { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface NicknameModalProps {
  open: boolean;
  onNicknameSet: (nickname: string) => Promise<void>;
}

export function NicknameModal({ open, onNicknameSet }: NicknameModalProps) {
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      toast.error('Please enter a nickname');
      return;
    }

    setIsSubmitting(true);

    try {
      await onNicknameSet(nickname.trim());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to set nickname');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidNickname = nickname.length >= 2 && /^[a-zA-Z0-9_-]+$/.test(nickname);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Choose Your Nickname
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a nickname to start chatting. This cannot be changed later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname"
              className="bg-gray-800 border-gray-700 text-white"
              maxLength={20}
              required
              autoFocus
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">
                {nickname.length}/20 characters
              </span>
              {nickname && (
                <span 
                  className={
                    nickname.length < 2 ? 'text-red-400' : 
                    !isValidNickname ? 'text-yellow-400' :
                    'text-green-400'
                  }
                >
                  {nickname.length < 2 ? 'Too short' :
                   !isValidNickname ? 'Invalid characters' :
                   'Valid nickname'}
                </span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
            disabled={isSubmitting || !isValidNickname}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining chat...
              </span>
            ) : (
              'Start Chatting'
            )}
          </Button>

          <div className="text-xs text-gray-400 text-center space-y-1">
            <p>Only letters, numbers, underscores, and hyphens are allowed.</p>
            <p>You must set a nickname to continue.</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}