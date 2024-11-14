import { z } from 'zod';

export const participantSchema = z.object({
  email: z.string().email('Invalid email address'),
  nickname: z.string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(50, 'Nickname must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nickname can only contain letters, numbers, underscores, and hyphens'),
});

export const paymentSchema = z.object({
  amount: z.number().min(1000, 'Minimum payment amount is €10'),
  currency: z.literal('eur'),
  email: z.string().email('Invalid email address'),
  nickname: z.string(),
});

export const winnerSchema = z.object({
  nickname: z.string(),
  email: z.string().email('Invalid email address'),
  amount: z.number().min(0, 'Prize amount cannot be negative'),
});

export type Participant = z.infer<typeof participantSchema>;
export type Payment = z.infer<typeof paymentSchema>;
export type Winner = z.infer<typeof winnerSchema>;