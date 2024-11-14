import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { pusherServer } from '@/lib/pusher/server';
import { CHANNELS, EVENTS } from '@/lib/pusher/constants';
import { Store } from '@/lib/db/store';
import { emailService } from '@/lib/email/service';
import { logger } from '@/lib/logger';
import type { Participant } from '@/lib/db/types';

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing Stripe configuration');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      const error = err as Error;
      logger.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { email, nickname } = paymentIntent.metadata;

        if (!email || !nickname) {
          logger.error('Missing required metadata:', paymentIntent.id);
          return NextResponse.json(
            { error: 'Invalid payment metadata' },
            { status: 400 }
          );
        }

        try {
          // Update store with new participant
          const state = await Store.load();
          const participant: Participant = {
            id: paymentIntent.id,
            nickname,
            email,
            timestamp: new Date(),
            verified: true
          };

          state.participants = [participant, ...state.participants];
          state.totalParticipants += 1;
          state.prizeAmount += 10;

          await Store.save(state);

          // Send confirmation email with invoice
          await emailService.sendParticipationConfirmation({
            nickname,
            email,
            transactionId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convert cents to euros
            date: new Date().toLocaleString(),
          });

          // Trigger new participant event via Pusher
          await pusherServer.trigger(CHANNELS.VAULT, EVENTS.VAULT.NEW_PARTICIPANT, {
            id: paymentIntent.id,
            nickname,
            timestamp: new Date(),
          });

          logger.info('New participation processed:', { nickname, email });
        } catch (error) {
          logger.error('Failed to process participation:', error);
          return NextResponse.json({
            received: true,
            warning: 'Participation processing failed'
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logger.error('Payment failed:', { 
          id: paymentIntent.id, 
          error: paymentIntent.last_payment_error?.message 
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}