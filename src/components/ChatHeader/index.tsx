import React from 'react';
import styles from './ChatHeader.module.css';
import { BackgroundSelector } from '../BGSelector';

interface ChatHeaderProps {
  background: string;
  setBackground: (background: string) => void;
  isConnected: boolean | null;
  onSettingsClick: () => void;
  isMinimized: boolean;
  onMinimizeClick: () => void;
  onCloseClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  background,
  setBackground,
  isConnected,
  onSettingsClick,
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
        <BackgroundSelector background={background} setBackground={setBackground} />
        <button 
          onClick={onSettingsClick} 
          className={styles.actionButton}
          aria-label="설정"
          data-testid="settings-button"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
          </svg>
        </button>
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