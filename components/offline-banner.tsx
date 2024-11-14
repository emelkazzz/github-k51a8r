"use client";

import { useEffect, useState, useRef } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import { pusherClient, reconnectPusher } from '@/lib/pusher/client';
import { EVENTS } from '@/lib/pusher/constants';
import { toast } from 'sonner';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const mounted = useRef(true);

  const handleReconnect = async () => {
    if (isReconnecting) return;

    try {
      setIsReconnecting(true);
      await reconnectPusher();
      if (mounted.current) {
        setIsOffline(false);
        setShowBanner(false);
        toast.success('Successfully reconnected');
      }
    } catch (error) {
      if (mounted.current) {
        toast.error('Failed to reconnect. Please try again.');
      }
    } finally {
      if (mounted.current) {
        setIsReconnecting(false);
      }
    }
  };

  useEffect(() => {
    mounted.current = true;

    const handleOnline = () => {
      if (mounted.current) {
        handleReconnect();
      }
    };

    const handleOffline = () => {
      if (mounted.current) {
        setIsOffline(true);
        setShowBanner(true);
      }
    };

    const handleConnectionState = ({ current }: { current: string }) => {
      if (!mounted.current) return;

      if (current === EVENTS.CONNECTION.CONNECTED) {
        setIsOffline(false);
        setShowBanner(false);
      } else if (current === EVENTS.CONNECTION.DISCONNECTED || current === EVENTS.CONNECTION.FAILED) {
        // Add a small delay before showing offline state to prevent flashing
        reconnectTimeout.current = setTimeout(() => {
          if (mounted.current) {
            setIsOffline(true);
            setShowBanner(true);
          }
        }, 3000);
      }
    };

    // Check initial connection state
    const initialState = pusherClient.connection.state;
    if (initialState !== EVENTS.CONNECTION.CONNECTED) {
      reconnectTimeout.current = setTimeout(() => {
        if (mounted.current && initialState !== EVENTS.CONNECTION.CONNECTED) {
          setIsOffline(true);
          setShowBanner(true);
        }
      }, 3000);
    }

    // Bind event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    pusherClient.connection.bind('state_change', handleConnectionState);

    return () => {
      mounted.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      pusherClient.connection.unbind('state_change', handleConnectionState);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <Alert className="fixed top-0 left-0 right-0 z-50 rounded-none bg-red-900 border-red-800 text-white flex items-center justify-between">
      <div className="flex items-center">
        <WifiOff className="h-4 w-4" />
        <span className="ml-2">
          You are currently offline. Some features may be unavailable.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReconnect}
        disabled={isReconnecting}
        className="ml-4 bg-red-800 border-red-700 hover:bg-red-700 hover:text-white"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isReconnecting ? 'animate-spin' : ''}`} />
        {isReconnecting ? 'Reconnecting...' : 'Reconnect'}
      </Button>
    </Alert>
  );
}