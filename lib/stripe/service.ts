import Stripe from 'stripe';
import { PaymentIntent } from './types';
import { AppError } from '../error';
import { logger } from '../logger';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export class StripeService {
  static async createPaymentIntent(params: {
    email: string;
    nickname: string;
  }): Promise<PaymentIntent> {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: 1000, // €10 in cents
        currency: 'eur',
        metadata: {
          email: params.email,
          nickname: params.nickname,
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never',
        },
        description: `Vault entry for ${params.nickname}`,
        receipt_email: params.email,
      });

      return {
        id: intent.id,
        amount: intent.amount,
        status: intent.status,
        client_secret: intent.client_secret!,
        metadata: {
          email: params.email,
          nickname: params.nickname,
        },
      };
    } catch (error) {
      logger.error('Stripe payment intent creation failed:', error);

      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case 'StripeCardError':
            throw AppError.PaymentFailed('Your card was declined. Please try another card.');
          case 'StripeRateLimitError':
            throw AppError.RateLimitExceeded('Too many payment attempts. Please wait a moment.');
          case 'StripeInvalidRequestError':
            throw AppError.BadRequest('Invalid payment request.');
          case 'StripeAPIError':
            throw AppError.ServerError('Payment service is temporarily unavailable.');
          case 'StripeConnectionError':
            throw AppError.ServerError('Could not connect to payment service.');
          default:
            throw AppError.PaymentFailed('Payment processing failed. Please try again.');
        }
      }

      throw AppError.ServerError('Payment service error');
    }
  }

  static async constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      logger.error('Webhook signature verification failed:', error);
      throw AppError.BadRequest('Invalid webhook signature');
    }
  }

  static async checkConnection(): Promise<boolean> {
    try {
      await stripe.paymentMethods.list({ limit: 1 });
      return true;
    } catch (error) {
      logger.error('Stripe connection check failed:', error);
      return false;
    }
  }
}