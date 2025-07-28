import { type FC } from 'react';
import styles from './ChatHeader.module.css';
import type { ChatHeaderProps } from './types';

export const ChatHeader: FC<ChatHeaderProps> = ({
  isConnected,
  isMinimized,
  onMinimizeClick,
  onCloseClick,
  onMouseDown,
}) => {
  return (
    <div className={styles.header} onMouseDown={onMouseDown}>
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
        <button 
          onClick={onMinimizeClick} 
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
          onClick={onCloseClick} 
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
  );
}; 

export default ChatHeader; 