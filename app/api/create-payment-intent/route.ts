import { NextResponse } from 'next/server';
import { z } from 'zod';
import Stripe from 'stripe';
import { AppError } from '@/lib/error';
import { logger } from '@/lib/logger';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const createPaymentIntentSchema = z.object({
  email: z.string().email('Invalid email address'),
  nickname: z.string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(50, 'Nickname must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nickname can only contain letters, numbers, underscores, and hyphens'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => {
      throw AppError.BadRequest('Invalid request body');
    });

    const validatedData = createPaymentIntentSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validatedData.error.errors 
        },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000, // €10 in cents
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        email: validatedData.data.email,
        nickname: validatedData.data.nickname,
      },
    });

    logger.info('Payment intent created', { 
      email: validatedData.data.email,
      nickname: validatedData.data.nickname 
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    logger.error('Payment intent creation failed', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details 
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}