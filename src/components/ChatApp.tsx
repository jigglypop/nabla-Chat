import React, { useState, useEffect, useRef } from 'react'
import styles from './ChatApp.module.css'

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
    <div className={`${styles.container} ${isMinimized ? styles.minimized : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.logoWrapper}>
            <svg width="36" height="36" viewBox="0 0 128 128" fill="currentColor" className={styles.logo}>
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
            <h3 className={styles.title}>Lovebug Chat</h3>
            <span className={styles.status}>
              <span className={styles.statusDot}></span>
              Always here to help
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className={styles.actionButton}
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
            className={styles.actionButton}
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
          <div className={styles.messagesContainer}>
            {messages.map((message) => (
              <div key={message.id} className={`${styles.messageWrapper} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
                <div className={`${styles.avatar} ${message.role === 'user' ? styles.userAvatar : styles.assistantAvatar}`}>
                  <span>{message.role === 'user' ? '👤' : '🤖'}</span>
                </div>
                <div className={styles.messageContent}>
                  <div className={`${styles.messageBubble} ${message.role === 'user' ? styles.userBubble : styles.assistantBubble}`}>
                    <p>{message.content}</p>
                  </div>
                  <span className={`${styles.timestamp} ${message.role === 'user' ? styles.userTimestamp : ''}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.messageWrapper} ${styles.assistantMessage}`}>
                <div className={`${styles.avatar} ${styles.assistantAvatar}`}>
                  <span>🤖</span>
                </div>
                <div className={`${styles.messageBubble} ${styles.assistantBubble} ${styles.typingBubble}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className={styles.inputContainer}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              rows={1}
              className={styles.input}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={styles.sendButton}
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