export interface ChatMessage {
  nickname: string;
  content: string;
  timestamp: string;
}

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
}

export interface Winner {
  nickname: string;
  amount: number;
}