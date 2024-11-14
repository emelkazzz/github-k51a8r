"use client";

import { AlertCircle, X } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <Alert className="m-4 bg-red-900/50 border-red-800 text-red-200 flex items-center justify-between">
      <div className="flex items-center">
        <AlertCircle className="h-4 w-4" />
        <span className="ml-2">{message}</span>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          className="h-4 w-4 p-0 hover:bg-transparent text-red-200 hover:text-white"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </Alert>
  );
}