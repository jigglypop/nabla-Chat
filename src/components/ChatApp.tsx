import React, { useState, useEffect, useRef } from 'react'
import '../styles/tailwind-chat.css'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatAppProps {
  onClose: () => void
}

const ChatApp: React.FC<ChatAppProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! Lovebug AI 어시스턴트입니다. 무엇을 도와드릴까요?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a mock response. Connect to your AI API for real responses!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`lb-relative lb-w-full lb-h-full lb-bg-gradient-to-br lb-from-lovebug-primary/10 lb-via-lovebug-secondary/10 lb-to-lovebug-tertiary/10 lb-backdrop-blur-2xl lb-rounded-3xl lb-border lb-border-white/20 lb-shadow-2xl lb-flex lb-flex-col lb-overflow-hidden lb-animate-lovebug-slideup ${isMinimized ? 'lb-h-[60px]' : ''}`}>
      {/* Header */}
      <div className="lb-px-6 lb-py-4 lb-bg-black/10 lb-border-b lb-border-white/10 lb-flex lb-justify-between lb-items-center lb-flex-shrink-0">
        <div className="lb-flex lb-items-center lb-gap-3">
          <div className="lb-w-9 lb-h-9 lb-flex lb-items-center lb-justify-center">
            <svg width="36" height="36" viewBox="0 0 128 128" fill="currentColor" className="lb-text-white">
              <rect width="128" height="128" fill="url(#lovebug-gradient)" rx="24"/>
              <defs>
                <linearGradient id="lovebug-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#12c2e9" />
                  <stop offset="50%" stopColor="#c471ed" />
                  <stop offset="100%" stopColor="#f64f59" />
                </linearGradient>
              </defs>
              <text x="64" y="80" textAnchor="middle" fill="white" fontSize="60" fontFamily="Arial, sans-serif" fontWeight="bold">L</text>
            </svg>
          </div>
          <div>
            <h3 className="lb-text-lg lb-font-bold lb-text-white lb-tracking-tight">Lovebug Chat</h3>
            <span className="lb-text-xs lb-text-lovebug-primary lb-font-medium lb-flex lb-items-center lb-gap-1">
              <span className="lb-w-1.5 lb-h-1.5 lb-bg-lovebug-primary lb-rounded-full"></span>
              Always here to help
            </span>
          </div>
        </div>
        <div className="lb-flex lb-gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="lb-w-8 lb-h-8 lb-bg-white/10 lb-rounded-lg lb-flex lb-items-center lb-justify-center lb-text-white/70 hover:lb-bg-white/20 hover:lb-text-white lb-transition-all hover:lb-scale-105"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              {isMinimized ? (
                <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
              ) : (
                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
              )}
            </svg>
          </button>
          <button 
            onClick={onClose} 
            className="lb-w-8 lb-h-8 lb-bg-white/10 lb-rounded-lg lb-flex lb-items-center lb-justify-center lb-text-white/70 hover:lb-bg-white/20 hover:lb-text-white lb-transition-all hover:lb-scale-105"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="lb-flex-1 lb-overflow-y-auto lb-p-6 lb-bg-black/5 lb-flex lb-flex-col lb-gap-5 lb-scrollbar-thin lb-scrollbar-thumb-lovebug-primary/50 lb-scrollbar-track-transparent">
            {messages.map((message) => (
              <div key={message.id} className={`lb-flex lb-gap-3 lb-animate-lovebug-message lb-max-w-[85%] ${message.role === 'user' ? 'lb-self-end lb-flex-row-reverse' : 'lb-self-start'}`}>
                <div className={`lb-w-9 lb-h-9 lb-rounded-full lb-flex lb-items-center lb-justify-center lb-flex-shrink-0 lb-backdrop-blur-md ${
                  message.role === 'user' 
                    ? 'lb-bg-gradient-to-br lb-from-lovebug-secondary lb-to-lovebug-tertiary lb-shadow-lg' 
                    : 'lb-bg-gradient-to-br lb-from-lovebug-primary lb-to-lovebug-secondary lb-shadow-lg'
                }`}>
                  <span className="lb-text-lg">{message.role === 'user' ? '👤' : '🤖'}</span>
                </div>
                <div className="lb-flex lb-flex-col lb-gap-1">
                  <div className={`lb-px-4 lb-py-3 lb-rounded-2xl lb-shadow-md ${
                    message.role === 'user' 
                      ? 'lb-bg-white/95 lb-text-gray-900 lb-rounded-br-md' 
                      : 'lb-bg-white/10 lb-backdrop-blur-md lb-border lb-border-white/20 lb-text-white lb-rounded-bl-md'
                  }`}>
                    <p className="lb-text-[15px] lb-leading-relaxed lb-break-words">{message.content}</p>
                  </div>
                  <span className={`lb-text-xs lb-text-white/60 lb-px-1 ${message.role === 'user' ? 'lb-text-right' : ''}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="lb-flex lb-gap-3 lb-self-start">
                <div className="lb-w-9 lb-h-9 lb-rounded-full lb-bg-gradient-to-br lb-from-lovebug-primary lb-to-lovebug-secondary lb-shadow-lg lb-flex lb-items-center lb-justify-center lb-flex-shrink-0">
                  <span className="lb-text-lg">🤖</span>
                </div>
                <div className="lb-bg-white/10 lb-backdrop-blur-md lb-border lb-border-white/20 lb-rounded-2xl lb-rounded-bl-md lb-px-4 lb-py-3 lb-shadow-md">
                  <div className="lb-flex lb-gap-1">
                    <span className="lb-w-2.5 lb-h-2.5 lb-bg-gradient-to-br lb-from-lovebug-primary lb-to-lovebug-secondary lb-rounded-full lb-animate-lovebug-typing"></span>
                    <span className="lb-w-2.5 lb-h-2.5 lb-bg-gradient-to-br lb-from-lovebug-primary lb-to-lovebug-secondary lb-rounded-full lb-animate-lovebug-typing lb-animation-delay-200"></span>
                    <span className="lb-w-2.5 lb-h-2.5 lb-bg-gradient-to-br lb-from-lovebug-primary lb-to-lovebug-secondary lb-rounded-full lb-animate-lovebug-typing lb-animation-delay-400"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="lb-p-5 lb-bg-black/10 lb-border-t lb-border-white/10 lb-flex lb-gap-3 lb-items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className="lb-flex-1 lb-min-h-[44px] lb-max-h-[120px] lb-px-4 lb-py-3 lb-bg-white/10 lb-backdrop-blur-md lb-border lb-border-white/20 lb-rounded-3xl lb-text-white lb-text-[15px] lb-resize-none lb-outline-none lb-placeholder-white/60 focus:lb-border-lovebug-primary/60 focus:lb-bg-white/15 focus:lb-ring-2 focus:lb-ring-lovebug-primary/20 lb-transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="lb-w-11 lb-h-11 lb-bg-gradient-to-r lb-from-lovebug-primary lb-via-lovebug-secondary lb-to-lovebug-tertiary lb-rounded-full lb-flex lb-items-center lb-justify-center lb-text-white lb-shadow-lg hover:lb-scale-110 active:lb-scale-95 disabled:lb-opacity-50 disabled:lb-cursor-not-allowed disabled:lb-bg-white/10 disabled:lb-bg-none lb-transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatApp 