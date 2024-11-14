import { z } from 'zod';

export const paymentIntentSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email is too long'),
  
  nickname: z.string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(50, 'Nickname must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nickname can only contain letters, numbers, underscores, and hyphens'),
  
  amount: z.number()
    .int('Amount must be an integer')
    .min(1000, 'Minimum payment amount is €10')
    .max(100000, 'Maximum payment amount is €1000'),
  
  currency: z.literal('eur'),
});