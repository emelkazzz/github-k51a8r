"use client";

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import type { Appearance } from '@stripe/stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PaymentForm } from '@/components/payment-form';
import { stripePromise } from '@/lib/stripe';
import { useVault } from '@/hooks/use-vault';
import { AlertCircle } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { useChatConnection } from '@/hooks/use-chat-connection';

interface ParticipateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ParticipateDialog({ open, onOpenChange }: ParticipateDialogProps) {
  const { isActive } = useVault();
  const [key, setKey] = useState(0);
  const { isConnected } = useChatConnection();

  // Reset Elements when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setKey(prev => prev + 1);
    }
    onOpenChange(newOpen);
  };

  const appearance: Appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#3b82f6',
      colorBackground: '#1f2937',
      colorText: '#ffffff',
      colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      borderRadius: '0.5rem',
      spacingUnit: '4px',
    },
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gradient-to-b from-blue-950 to-purple-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Join The Vault
          </DialogTitle>
          <DialogDescription className="text-center text-blue-200">
            Enter for €10 for a chance to win this week's prize pool
          </DialogDescription>
        </DialogHeader>

        {!isConnected && (
          <Alert className="bg-yellow-900/50 border-yellow-800 text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <span>Waiting for connection...</span>
          </Alert>
        )}

        {!isActive ? (
          <Alert className="bg-yellow-900/50 border-yellow-800 text-yellow-200">
            <AlertCircle className="h-4 w-4" />
            <span>
              The vault is currently closed. New entries open Monday at 10:00.
            </span>
          </Alert>
        ) : (
          <Elements 
            key={key}
            stripe={stripePromise} 
            options={{
              mode: 'payment',
              amount: 1000,
              currency: 'eur',
              appearance,
              loader: 'auto',
            }}
          >
            <PaymentForm 
              onSuccess={() => handleOpenChange(false)}
              disabled={!isConnected}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}