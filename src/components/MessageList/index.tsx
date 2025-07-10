import React, { useRef, useEffect } from 'react';
import styles from './MessageList.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  userProfile?: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, userProfile }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={styles.messagesContainer}>
      {messages.map((message) => (
        <div key={message.id} className={`${styles.messageWrapper} ${message.role === 'user' ? styles.userMessage : styles.assistantMessage}`}>
          <div className={`${styles.avatar} ${message.role === 'user' ? styles.userAvatar : styles.assistantAvatar}`}>
            {message.role === 'user' ? (
              userProfile ? (
                <img 
                  src={userProfile} 
                  alt="User"
                  className={styles.userAvatarImage}
                />
              ) : (
                <span>👤</span>
              )
            ) : (
              <img 
                src={chrome.runtime.getURL('profile/nchat.png')} 
                alt="AI Assistant"
                className={styles.avatarImage}
              />
            )}
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
            <img 
              src={chrome.runtime.getURL('profile/nchat.png')} 
              alt="AI Assistant"
              className={styles.avatarImage}
            />
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
  );
}; 