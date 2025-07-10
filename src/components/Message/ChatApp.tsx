import React, { useState, useEffect, useRef } from 'react'
import styles from './ChatApp.module.css'
import type { ChatAppProps, Message } from './types'
import { BackgroundSelector } from '../../../components/BGSelector'
import { backgrounds } from '../../../components/BGSelector/constants'
import useResize from '..'

const ChatApp: React.FC<ChatAppProps> = ({ onClose }) => {
  const {
    onMouseMove,
    onMouseUp,
    onResize,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    chatPosition,
    setChatPosition,
    chatSize,
    setChatSize,
    dragStart,
    containerRef,
    setDragStart
  } = useResize()
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
  const [background, setBackground] = useState(() => {
    return localStorage.getItem('lovebug-background') || 'gradient1';
  });
  
  const currentBg = backgrounds.find(bg => bg.id === background) || backgrounds[0];
  const isDarkTheme = ['gradient4', 'gradient5', 'gradient6'].includes(background);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SEND_TO_CHAT' && event.data.text) {
        setInput(event.data.text)
        setTimeout(() => {
          handleSend()
        }, 100)
      } else if (event.data.type === 'RESIZE_CHAT' && event.data.direction) {
        // 크기 조절 단축키 처리
        setChatSize((prevSize: { width: number, height: number }) => {
          const step = 50
          let newWidth, newHeight
          
          if (event.data.direction === 'larger') {
            newWidth = Math.min(window.innerWidth - 40, prevSize.width + step)
            newHeight = Math.min(window.innerHeight - 40, prevSize.height + step)
          } else {
            newWidth = Math.max(320, prevSize.width - step)
            newHeight = Math.max(400, prevSize.height - step)
          }
          // 크기가 변경되면 위치도 조정해야 할 수 있음
          setChatPosition((prevPos: { x: number, y: number }) => {
            // 화면 경계를 벗어나지 않도록 위치 조정
            const newX = Math.min(prevPos.x, window.innerWidth - newWidth)
            const newY = Math.min(prevPos.y, window.innerHeight - newHeight)
            return { x: Math.max(0, newX), y: Math.max(0, newY) }
          })
          
          return { width: newWidth, height: newHeight }
        })
      }
    }
    
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [input]) // input dependency 추가

  useEffect(() => {
    if (isResizing || isDragging) {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      document.body.style.cursor = isResizing ? (isResizing + '-resize') : 'move'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, isDragging, dragStart, chatSize, chatPosition])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
        content: '목업용 대화입니다!',
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

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setIsDragging(true)
  }

  useEffect(() => {
    localStorage.setItem('lovebug-chat-size', JSON.stringify(chatSize))
  }, [chatSize])
  
  useEffect(() => {
    localStorage.setItem('lovebug-chat-position', JSON.stringify(chatPosition))
  }, [chatPosition])
  
  useEffect(() => {
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [chatSize.width, chatSize.height])

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${isMinimized ? styles.minimized : ''}`} 
      style={{ 
        '--chat-bg': currentBg.value,
        width: chatSize.width + 'px',
        height: isMinimized ? '60px' : chatSize.height + 'px',
        left: chatPosition.x + 'px',
        top: chatPosition.y + 'px'
      } as React.CSSProperties}
      data-theme={isDarkTheme ? 'dark' : 'light'}
    >
      {/* 크기 조절 핸들들 */}
      <div className={`${styles.resizeHandle} ${styles.resizeTop}`} onMouseDown={() => setIsResizing('top')} />
      <div className={`${styles.resizeHandle} ${styles.resizeRight}`} onMouseDown={() => setIsResizing('right')} />
      <div className={`${styles.resizeHandle} ${styles.resizeBottom}`} onMouseDown={() => setIsResizing('bottom')} />
      <div className={`${styles.resizeHandle} ${styles.resizeLeft}`} onMouseDown={() => setIsResizing('left')} />
      <div className={`${styles.resizeHandle} ${styles.resizeTopLeft}`} onMouseDown={() => setIsResizing('top-left')} />
      <div className={`${styles.resizeHandle} ${styles.resizeTopRight}`} onMouseDown={() => setIsResizing('top-right')} />
      <div className={`${styles.resizeHandle} ${styles.resizeBottomLeft}`} onMouseDown={() => setIsResizing('bottom-left')} />
      <div className={`${styles.resizeHandle} ${styles.resizeBottomRight}`} onMouseDown={() => setIsResizing('bottom-right')} />
      <div className={styles.header} onMouseDown={handleHeaderMouseDown}>
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
            <p className={styles.title}>러브버그챗</p>
            <span className={styles.status}>
              <span className={styles.statusDot}></span>
              연결중
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <BackgroundSelector background={background} setBackground={setBackground} />
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className={styles.actionButton}
            aria-label={isMinimized ? '최대화' : '최소화'}
            data-testid="minimize-button"
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
            aria-label="닫기"
            data-testid="close-button"
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
              placeholder="메시지를 입력하세요"
              rows={1}
              className={styles.input}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={styles.sendButton}
              aria-label="전송"
              data-testid="send-button"
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