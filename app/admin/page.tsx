"use client";

import { useState, useEffect } from 'react';
import { Shield, Users, Trophy, LogOut, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminParticipantList } from '@/components/admin/participant-list';
import { AdminStats } from '@/components/admin/stats';
import { useVault } from '@/hooks/use-vault';
import { useAdminAuth } from '@/hooks/use-admin-auth';
import { pusherClient } from '@/lib/pusher/client';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { Alert } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AddParticipantDialog } from '@/components/admin/add-participant-dialog';
import { DebugPanel } from '@/components/admin/debug-panel';
import { toast } from 'sonner';

export default function AdminPage() {
  const { participants, prizeAmount, isActive, isLoading: vaultLoading } = useVault();
  const { logout, isAuthorized } = useAdminAuth();
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManualWinnerSelection = async (participantId: string) => {
    try {
      if (!isActive) {
        toast.error('Cannot select winner while vault is inactive');
        return;
      }

      setError(null);
      setIsSelecting(true);
      
      const response = await fetch('/api/vault/winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participantId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to select winner');
      }

      toast.success('Winner selected successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to select winner';
      setError(message);
      toast.error(message);
    } finally {
      setIsSelecting(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;

    const channel = pusherClient.subscribe(CHANNELS.VAULT);

    channel.bind(EVENTS.VAULT.WINNER_SELECTED, (data: { nickname: string; amount: number }) => {
      toast.success(
        `Winner selected: ${data.nickname}`,
        {
          description: `Prize amount: €${data.amount.toLocaleString()}`,
        }
      );
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(CHANNELS.VAULT);
    };
  }, [isAuthorized]);

  if (vaultLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <DebugPanel />
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {!isActive && (
          <Alert className="mb-6 bg-yellow-900/50 border-yellow-800 text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <span className="ml-2">
              The vault is currently inactive. New round starts Monday at 10:00.
            </span>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-900/50 border-red-800 text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span className="ml-2">{error}</span>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-8">
          <AdminStats />
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Users className="mr-2 h-6 w-6" />
              Current Participants
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Total Prize: €{prizeAmount.toLocaleString()}
              </span>
              <AddParticipantDialog disabled={!isActive} />
            </div>
          </div>

          <AdminParticipantList 
            participants={participants}
            onSelectWinner={handleManualWinnerSelection}
            isSelecting={isSelecting}
            isVaultActive={isActive}
          />
        </div>
      </div>
    </div>
  );
}