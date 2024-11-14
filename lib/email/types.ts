export interface EmailTemplate {
  getSubject: (data: any) => string;
  getHtml: (data: any) => string;
}

export interface EmailService {
  verifyConnection: () => Promise<void>;
  
  sendParticipationConfirmation: (params: {
    nickname: string;
    email: string;
    transactionId: string;
    amount: number;
    date: string;
  }) => Promise<void>;
  
  sendWinnerNotification: (params: {
    nickname: string;
    email: string;
    amount: number;
  }) => Promise<void>;
}