import React, { useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import styles from './ChatApp.module.css';
import type { ChatAppProps, Message } from './types';
import { BackgroundSelector } from '../../components/BGSelector';
import { backgrounds } from '../../components/BGSelector/constants';
import { SettingsModal } from '../../components/SettingsModal';
import useResize from '../../hooks/useResize';
import { useAIChat } from '../../hooks/useAIChat';
import {
  messagesAtom,
  inputAtom,
  isMinimizedAtom,
  backgroundAtom,
  chatPositionAtom,
  chatSizeAtom
} from '../../atoms/chatAtoms';

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
  const [isMinimized, setIsMinimized] = useAtom(isMinimizedAtom);
  const [background, setBackground] = useAtom(backgroundAtom);
  const [chatPosition, setChatPosition] = useAtom(chatPositionAtom);
  const [chatSize, setChatSize] = useAtom(chatSizeAtom);

  const { sendMessage, isLoading, isConnected } = useAIChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    sendMessage(input);
    setInput('');
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
      data-background={background}
    >
      <div className={`${styles.resizeHandle} ${styles.resizeTop}`} onMouseDown={() => setIsResizing('top')} />
      {/* 우측 리사이즈 핸들 제거 - 스크롤바와 겹침 */}
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
              <rect width="128" height="128" fill="url(#nabla-gradient)" rx="24"/>
              <defs>
                <linearGradient id="nabla-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#12c2e9" />
                  <stop offset="50%" stopColor="#c471ed" />
                  <stop offset="100%" stopColor="#f64f59" />
                </linearGradient>
              </defs>
              <text x="64" y="80" textAnchor="middle" fill="white" fontSize="60" fontFamily="Arial, sans-serif" fontWeight="bold">∇</text>
            </svg>
          </div>
          <div>
            <p className={styles.title}>∇·Chat</p>
            <span className={`${styles.status} ${isConnected === false ? styles.disconnected : ''}`}>
              <span className={`${styles.statusDot} ${
                isConnected === null ? styles.checking : 
                isConnected ? styles.connected : 
                styles.disconnected
              }`}></span>
              {isConnected === null ? '연결 확인 중...' : 
               isConnected ? '연결됨' : 
               '연결 안됨'}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <BackgroundSelector background={background} setBackground={setBackground} />
          <button 
            onClick={() => setIsSettingsOpen(true)} 
            className={styles.actionButton}
            aria-label="설정"
            data-testid="settings-button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
            </svg>
          </button>
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
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

export default ChatApp 