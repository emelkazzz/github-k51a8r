"use client";

import { useCallback } from 'react';
import { toast } from 'sonner';
import { AppError, isAppError } from '@/lib/error';

export function useErrorHandler() {
  const handleError = useCallback((error: unknown) => {
    if (isAppError(error)) {
      switch (error.code) {
        case 'PAYMENT_FAILED':
          toast.error('Payment failed. Please check your card details and try again.');
          break;
        case 'VALIDATION_FAILED':
          toast.error(error.message || 'Please check your input and try again.');
          break;
        case 'RATE_LIMIT_EXCEEDED':
          toast.error('Too many attempts. Please wait a moment and try again.');
          break;
        case 'UNAUTHORIZED':
          toast.error('Please log in to continue.');
          break;
        case 'DATABASE_ERROR':
          toast.error('A system error occurred. Please try again later.');
          break;
        default:
          toast.error(error.message || 'An unexpected error occurred.');
          console.error('Unhandled error:', error);
      }
    } else {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Unhandled error:', error);
    }
  }, []);

  return handleError;
}