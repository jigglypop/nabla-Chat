export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  read?: boolean;
}

export interface ChatAppProps {
  onClose: () => void
}