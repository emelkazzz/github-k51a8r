export interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  client_secret: string;
  metadata: {
    email: string;
    nickname: string;
  };
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}