"use client";

import { useState, useRef } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import type { StripeError } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { ErrorMessage } from '@/components/chat/error-message';
import { AppError } from '@/lib/error';

interface PaymentFormProps {
  onSuccess: () => void;
  disabled?: boolean;
}

export function PaymentForm({ onSuccess, disabled }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleError = useErrorHandler();
  const abortController = useRef<AbortController | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements || disabled) {
      setError('Payment system is not ready');
      return;
    }

    // Cancel any pending requests
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsLoading(true);

    try {
      // Validate the payment element first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new AppError(submitError.message || 'Invalid payment details', 'PAYMENT_FAILED', 400);
      }

      // Create payment intent with timeout
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(formData),
        signal: abortController.current.signal,
        keepalive: true,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new AppError(
          errorData.error || 'Failed to initialize payment',
          errorData.code || 'PAYMENT_FAILED',
          response.status,
          errorData.details
        );
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new AppError('Invalid payment session', 'PAYMENT_FAILED', 400);
      }

      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment/complete`,
          payment_method_data: {
            billing_details: {
              email: formData.email,
            },
          },
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        throw new AppError(paymentError.message || 'Payment failed', 'PAYMENT_FAILED', 400);
      }

      if (paymentIntent?.status === 'succeeded') {
        toast.success('Successfully joined The Vault!');
        onSuccess();
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      handleError(error);
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError(null);
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          className="bg-black/20 border-white/10 text-white"
          value={formData.email}
          onChange={handleInputChange('email')}
          disabled={isLoading || disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          placeholder="Choose a nickname"
          className="bg-black/20 border-white/10 text-white"
          value={formData.nickname}
          onChange={handleInputChange('nickname')}
          pattern="^[a-zA-Z0-9_-]+$"
          title="Only letters, numbers, underscores, and hyphens are allowed"
          disabled={isLoading || disabled}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Payment Details</Label>
        <div className="bg-black/20 border border-white/10 rounded-md p-3">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
            onChange={() => setError(null)}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={isLoading || !stripe || !elements || disabled}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay €10 to Enter'
        )}
      </Button>
    </form>
  );
}