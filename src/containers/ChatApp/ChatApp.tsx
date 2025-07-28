import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import styles from './ChatApp.module.css';
import type { ChatAppProps } from './types';
import { ChatHeader } from '../../components/ChatHeader';
import { MessageList } from '../../components/MessageList';
import { ChatInput } from '../../components/ChatInput';
import useResize from '../../hooks/useResize';
import { useAIChat } from '../../hooks/useAIChat';
import { useSettings } from '../../hooks/useSettings';
import {
  messagesAtom,
  inputAtom,
  isMinimizedAtom,
  chatPositionAtom,
  chatSizeAtom
} from '../../atoms/chatAtoms';
import { backgrounds } from './contants';

const ChatApp: React.FC<ChatAppProps> = ({ onClose }) => {
  const {
    onResize,
    isDragging,
    setIsDragging,
    isResizing,
    setIsResizing,
    containerRef,
    setDragStart
  } = useResize();

  const [messages, setMessages] = useAtom(messagesAtom);
  const [input, setInput] = useAtom(inputAtom);
  const [isMinimized, setIsMinimized] = useAtom(isMinimizedAtom);
  const [chatPosition, setChatPosition] = useAtom(chatPositionAtom);
  const [chatSize, setChatSize] = useAtom(chatSizeAtom);
  const { settings } = useSettings();
  const { sendMessage, isLoading, isConnected } = useAIChat();



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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
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
      document.body.style.cursor = isResizing ? isResizing + '-resize' : 'move';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, isDragging]);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  return (
   <div
    ref={containerRef}
    className={`${styles.container} ${isMinimized ? styles.minimized : ''}`}
    style={
     {
      '--chat-bg': backgrounds[0],
      width: chatSize.width + 'px',
      height: isMinimized ? '60px' : chatSize.height + 'px',
      left: chatPosition.x + 'px',
      top: chatPosition.y + 'px',
     } as React.CSSProperties
    }
    data-theme={'dark'}
   >
    <div
     className={`${styles.resizeHandle} ${styles.resizeTop}`}
     onMouseDown={() => setIsResizing('top')}
    />
    {/* 우측 리사이즈 핸들 제거 - 스크롤바와 겹침 */}
    <div
     className={`${styles.resizeHandle} ${styles.resizeBottom}`}
     onMouseDown={() => setIsResizing('bottom')}
    />
    <div
     className={`${styles.resizeHandle} ${styles.resizeLeft}`}
     onMouseDown={() => setIsResizing('left')}
    />
    <div
     className={`${styles.resizeHandle} ${styles.resizeTopLeft}`}
     onMouseDown={() => setIsResizing('top-left')}
    />
    <div
     className={`${styles.resizeHandle} ${styles.resizeTopRight}`}
     onMouseDown={() => setIsResizing('top-right')}
    />
    <div
     className={`${styles.resizeHandle} ${styles.resizeBottomLeft}`}
     onMouseDown={() => setIsResizing('bottom-left')}
    />
    <div
     className={`${styles.resizeHandle} ${styles.resizeBottomRight}`}
     onMouseDown={() => setIsResizing('bottom-right')}
    />
    <ChatHeader
     isConnected={isConnected}
     isMinimized={isMinimized}
     onMinimizeClick={() => setIsMinimized(!isMinimized)}
     onCloseClick={onClose}
     onMouseDown={handleHeaderMouseDown}
    />
    {!isMinimized && (
     <>
      <MessageList messages={messages} isLoading={isLoading} userProfile={settings.userProfile} />
      <ChatInput value={input} onChange={setInput} onSend={handleSend} disabled={isLoading} />
     </>
    )}
   </div>
  )
}

export default ChatApp 