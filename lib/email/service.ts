import { EmailService } from './types';
import { sendEmail, verifyConnection } from './transport';
import { participationTemplate } from './templates/participation';
import { winnerTemplate } from './templates/winner';
import { logger } from '../logger';
import { participantSchema, winnerSchema } from '../validation';

class EmailServiceImpl implements EmailService {
  async verifyConnection(): Promise<void> {
    await verifyConnection();
  }

  async sendParticipationConfirmation(params: {
    nickname: string;
    email: string;
    transactionId: string;
    amount: number;
    date: string;
  }): Promise<void> {
    try {
      const validated = participantSchema.parse({
        nickname: params.nickname,
        email: params.email,
      });
      
      await sendEmail({
        to: validated.email,
        subject: participationTemplate.getSubject({ nickname: validated.nickname }),
        html: participationTemplate.getHtml({
          nickname: validated.nickname,
          transactionId: params.transactionId,
          amount: params.amount,
          date: params.date,
        }),
      });

      logger.emailSent('participation', validated.email);
    } catch (error) {
      logger.emailError('participation confirmation', error);
      throw error;
    }
  }

  async sendWinnerNotification(params: {
    nickname: string;
    email: string;
    amount: number;
  }): Promise<void> {
    try {
      const validated = winnerSchema.parse(params);
      
      await sendEmail({
        to: validated.email,
        subject: winnerTemplate.getSubject({ nickname: validated.nickname }),
        html: winnerTemplate.getHtml({ 
          nickname: validated.nickname,
          amount: validated.amount,
        }),
      });

      logger.emailSent('winner', validated.email);
    } catch (error) {
      logger.emailError('winner notification', error);
      throw error;
    }
  }
}

export const emailService = new EmailServiceImpl();