import { EmailTemplate } from '../types';
import { formatCurrency } from '@/lib/utils';

export const winnerTemplate: EmailTemplate = {
  getSubject: (data: { nickname: string }) => 
    'Congratulations! You Won The Vault Prize! 🎉',
  
  getHtml: (data: { nickname: string; amount: number }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're The Winner!</title>
      </head>
      <body style="font-family: sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; text-align: center;">🎉 Congratulations!</h1>
          </div>
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #1f2937; font-size: 16px; line-height: 24px;">Dear ${data.nickname},</p>
            <p style="color: #1f2937; font-size: 16px; line-height: 24px;">We're thrilled to announce that you're this week's winner of The Vault!</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="color: #1f2937; font-size: 20px; font-weight: bold; margin: 0;">Your Prize Amount:</p>
              <p style="color: #3b82f6; font-size: 32px; font-weight: bold; margin: 10px 0;">${formatCurrency(data.amount)}</p>
            </div>
            <p style="color: #1f2937; font-size: 16px; line-height: 24px;">We'll be in touch shortly with details about claiming your prize.</p>
            <p style="color: #1f2937; font-size: 16px; line-height: 24px; margin-bottom: 0;">Best regards,<br>The Vault Team</p>
          </div>
        </div>
      </body>
    </html>
  `,
};