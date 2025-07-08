export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatAppProps {
  onClose: () => void
  windowSize?: 'small' | 'medium' | 'large'
}