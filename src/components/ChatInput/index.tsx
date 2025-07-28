import { useRef, type FC, type KeyboardEventHandler } from 'react';
import styles from './ChatInput.module.css';
import type { ChatInputProps } from './types';


export const ChatInput: FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSend, 
  disabled = false,
  placeholder = "메시지를 입력하세요"
}) => {

  const handleKeyPress: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={styles.inputContainer}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={placeholder}
        rows={1}
        className={styles.input}
      />
      <button 
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className={styles.sendButton}
        aria-label="전송"
        data-testid="send-button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  );
}; 