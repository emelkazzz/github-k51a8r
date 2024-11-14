import { z } from 'zod';

export const chatMessageSchema = z.object({
  nickname: z.string()
    .min(2, 'Nickname must be at least 2 characters')
    .max(20, 'Nickname must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Nickname can only contain letters, numbers, underscores, and hyphens'),
  
  content: z.string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message is too long')
    .refine(
      (content) => !containsProfanity(content),
      'Message contains inappropriate content'
    ),
  
  timestamp: z.string().datetime(),
});

// Simple profanity filter - in production, use a proper library
function containsProfanity(content: string): boolean {
  const profanityList = ['badword1', 'badword2']; // Replace with actual list
  return profanityList.some(word => 
    content.toLowerCase().includes(word.toLowerCase())
  );
}