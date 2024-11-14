import { EmailTemplate } from '../types';
import { formatCurrency } from '@/lib/utils';

export const participationTemplate: EmailTemplate = {
  getSubject: (data: { nickname: string }) => 
    'The Vault - Entry Confirmation and Invoice',
  
  getHtml: (data: { 
    nickname: string;
    transactionId: string;
    amount: number;
    date: string;
  }) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The Vault - Entry Confirmation</title>
      </head>
      <body style="font-family: sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #1a365d, #2d3748); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #ffffff; margin: 0; text-align: center;">Welcome to The Vault!</h1>
          </div>

          <!-- Confirmation Message -->
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #1f2937; font-size: 16px; line-height: 24px;">Hello ${data.nickname},</p>
            <p style="color: #1f2937; font-size: 16px; line-height: 24px;">Your entry to The Vault has been confirmed! You're now in the running to win this week's prize pool.</p>
            
            <!-- Invoice Details -->
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0;">Invoice Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Transaction ID:</td>
                  <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.transactionId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Date:</td>
                  <td style="padding: 8px 0; color: #1f2937; text-align: right;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #4b5563;">Amount:</td>
                  <td style="padding: 8px 0; color: #1f2937; text-align: right; font-weight: bold;">
                    ${formatCurrency(data.amount)}
                  </td>
                </tr>
              </table>
            </div>

            <p style="color: #1f2937; font-size: 16px; line-height: 24px;">The draw will take place this Sunday at midnight (00:00). We'll notify you if you're the lucky winner!</p>
            
            <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #1e40af; margin: 0; font-size: 14px;">
                Keep this email as your proof of participation. Good luck!
              </p>
            </div>

            <p style="color: #1f2937; font-size: 16px; line-height: 24px; margin-bottom: 0;">Best regards,<br>The Vault Team</p>
          </div>
        </div>
      </body>
    </html>
  `,
};