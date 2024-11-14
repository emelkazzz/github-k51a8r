"use client";

import { Wifi, WifiOff } from 'lucide-react';
import { Alert } from '@/components/ui/alert';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  if (isConnected) {
    return null;
  }

  return (
    <Alert className="m-4 bg-yellow-900/50 border-yellow-800 text-yellow-200">
      <WifiOff className="h-4 w-4" />
      <span className="ml-2">
        Connecting to chat...
      </span>
    </Alert>
  );
}