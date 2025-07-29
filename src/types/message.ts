export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  read?: boolean;
} 

export interface MessageType {
  type: "COMMAND";
  payload: {
    command: 'toggle-chat' | 'resize-larger' | 'resize-smaller'
  }
} 