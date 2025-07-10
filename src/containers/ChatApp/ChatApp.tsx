import React, { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import styles from './ChatApp.module.css';
import type { ChatAppProps, Message } from './types';
import { BackgroundSelector } from '../../components/BGSelector';
import { backgrounds } from '../../components/BGSelector/constants';
import useResize from '../../hooks/useResize';
import {
  messagesAtom,
  inputAtom,
  isLoadingAtom,
  isMinimizedAtom,
  backgroundAtom,
  chatPositionAtom,
  chatSizeAtom
} from '../../atoms/chatAtoms';
import { getOpenAIChatCompletion } from '../../services/openai';

const ChatApp: React.FC<ChatAppProps> = ({ onClose }) => {
  const {
    onMouseMove,
    onMouseUp,
    onResize,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    dragStart,
    containerRef,
    setDragStart
  } = useResize();

  const [messages, setMessages] = useAtom(messagesAtom);
  const [input, setInput] = useAtom(inputAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [isMinimized, setIsMinimized] = useAtom(isMinimizedAtom);
  const [background, setBackground] = useAtom(backgroundAtom);
  const [chatPosition, setChatPosition] = useAtom(chatPositionAtom);
  const [chatSize, setChatSize] = useAtom(chatSizeAtom);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentBg = backgrounds.find(bg => bg.id === background) || backgrounds[0];
  const isDarkTheme = ['gradient4', 'gradient5', 'gradient6'].includes(background);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SEND_TO_CHAT' && event.data.text) {
        setInput(event.data.text);
        setTimeout(() => {
          handleSend();
        }, 100);
      } else if (event.data.type === 'RESIZE_CHAT' && event.data.direction) {
        setChatSize((prevSize) => {
          const step = 50;
          let newWidth, newHeight;
          if (event.data.direction === 'larger') {
            newWidth = Math.min(window.innerWidth - 40, prevSize.width + step);
            newHeight = Math.min(window.innerHeight - 40, prevSize.height + step);
          } else {
            newWidth = Math.max(320, prevSize.width - step);
            newHeight = Math.max(400, prevSize.height - step);
          }
          setChatPosition((prevPos) => {
            const newX = Math.min(prevPos.x, window.innerWidth - newWidth);
            const newY = Math.min(prevPos.y, window.innerHeight - newHeight);
            return { x: Math.max(0, newX), y: Math.max(0, newY) };
          });
          return { width: newWidth, height: newHeight };
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [input, setInput, setChatSize, setChatPosition]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const aiResponse = await getOpenAIChatCompletion(newMessages);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse || '죄송합니다. 응답을 생성하지 못했습니다.',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  useEffect(() => {
    if (isResizing || isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.body.style.cursor = isResizing ? isResizing + '-resize' : 'move';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, isDragging, onMouseMove, onMouseUp]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

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