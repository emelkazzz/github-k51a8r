export interface VaultState {
  prizeAmount: number;
  participants: Participant[];
  totalParticipants: number;
  winner: Winner | null;
  chatHistory: ChatMessage[];
  isActive: boolean;
}

export interface Participant {
  id: string;
  nickname: string;
  email: string;
  timestamp: Date;
  verified: boolean;
}

export interface Winner {
  nickname: string;
  email: string;
  amount: number;
  timestamp: Date;
}

export interface ChatMessage {
  nickname: string;
  content: string;
  timestamp: string;
}