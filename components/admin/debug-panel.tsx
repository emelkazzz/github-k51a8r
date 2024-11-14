"use client";

import { useState } from 'react';
import { Bug, Play, Trophy, RefreshCw, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  const testWinnerAnnouncement = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/test-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: "TestWinner",
          amount: 1000,
          message: "This is a test winner announcement",
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger test winner announcement');
      }

      toast.success('Test winner announcement triggered');
    } catch (error) {
      toast.error('Failed to trigger test');
    } finally {
      setIsLoading(false);
    }
  };

  const previewWinnerLanding = async () => {
    if (previewActive) {
      toast.error('Preview already active');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/debug/preview-winner', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to enable winner preview');
      }

      setPreviewActive(true);
      setOpen(false);
      toast.success('Winner preview started (30 seconds)');

      // Reset preview after 30 seconds
      setTimeout(async () => {
        try {
          await fetch('/api/debug/preview-winner', {
            method: 'DELETE',
          });
          setPreviewActive(false);
          toast.info('Winner preview ended');
        } catch (error) {
          console.error('Failed to end preview:', error);
          setPreviewActive(false);
        }
      }, 30000);
    } catch (error) {
      toast.error('Failed to start winner preview');
      setPreviewActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-yellow-900/50 border-yellow-800 text-yellow-200 hover:bg-yellow-900/70">
          <Bug className="h-4 w-4 mr-2" />
          Debug Mode
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug Controls
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-400">Winner Testing</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={testWinnerAnnouncement}
                className="w-full"
                disabled={isLoading || previewActive}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Test Winner Animation
              </Button>
              
              <Button
                onClick={previewWinnerLanding}
                variant="secondary"
                className="w-full"
                disabled={isLoading || previewActive}
              >
                <Layout className="h-4 w-4 mr-2" />
                Preview Winner Landing (30s)
              </Button>
            </div>
          </div>

          <div className="p-4 bg-yellow-900/20 border border-yellow-900/50 rounded-lg">
            <p className="text-sm text-yellow-200">
              Debug mode is for testing purposes only. Actions performed here will not affect the actual vault state.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}