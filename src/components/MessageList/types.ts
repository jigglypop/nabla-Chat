export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  userProfile?: string | null;
}
