import React, { useState, useRef } from 'react';
import styles from './FloatingUI.module.css';
import { getOpenAIChatCompletion } from '../../services/openai';
import type { Message } from '../ChatApp/types';

interface FloatingUIProps {
  selectedText: string;
  onClose: () => void;
  onExecutePlugin: (pluginId: string, text: string) => Promise<void>;
}

const FloatingUI: React.FC<FloatingUIProps> = ({ selectedText, onClose, onExecutePlugin }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activePlugin, setActivePlugin] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePluginClick = async (pluginId: string) => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    setError(null);
    setResult('');
    setActivePlugin(pluginId);
    
    try {
      const messages: Message[] = [
        { id: '1', role: 'user', content: getPromptForPlugin(pluginId, selectedText), timestamp: new Date() }
      ];
      const response = await getOpenAIChatCompletion(messages);
      setResult(response || '응답을 받지 못했습니다.');
    } catch (error) {
      console.error('Plugin execution failed:', error);
      const errorMessage = error instanceof Error ? error.message : '오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const getPromptForPlugin = (pluginId: string, text: string): string => {
    switch (pluginId) {
      case 'summarize':
        return `다음 텍스트를 핵심 내용만 간결하게 한국어로 요약해 주세요.\n\n[TEXT]:\n${text}`;
      case 'translate':
        return `다음 텍스트를 영어로 번역해 주세요. 번역된 텍스트만 응답으로 제공해 주세요.\n\n[TEXT]:\n${text}`;
      case 'explain':
        return `다음 텍스트나 개념에 대해 한국어로 자세히 설명해 주세요. 일반인이 이해하기 쉽게 예시를 들어주면 좋습니다.\n\n[TEXT]:\n${text}`;
      case 'rewrite':
        return `다음 텍스트를 더 명확하고 자연스러운 표현으로 다시 작성해 주세요. 원본의 의미는 유지해야 합니다.\n\n[TEXT]:\n${text}`;
      default:
        return text;
    }
  };

  return (
    <div ref={containerRef} className={styles.floatingContainer}>
      <div className={styles.floatingHeader}>
        <span className={styles.floatingTitle}>AI Assistant</span>
        <button className={styles.closeBtn} onClick={onClose} title="닫기">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      
      <div className={styles.floatingActions}>
        <button 
          className={`${styles.floatingBtn} ${activePlugin === 'summarize' ? styles.active : ''}`}
          onClick={() => handlePluginClick('summarize')} 
          disabled={isExecuting}
          title="요약"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
          </svg>
        </button>
        <button 
          className={`${styles.floatingBtn} ${activePlugin === 'translate' ? styles.active : ''}`}
          onClick={() => handlePluginClick('translate')} 
          disabled={isExecuting}
          title="번역"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
        </button>
        <button 
          className={`${styles.floatingBtn} ${activePlugin === 'explain' ? styles.active : ''}`}
          onClick={() => handlePluginClick('explain')} 
          disabled={isExecuting}
          title="설명"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
          </svg>
        </button>
        <button 
          className={`${styles.floatingBtn} ${activePlugin === 'rewrite' ? styles.active : ''}`}
          onClick={() => handlePluginClick('rewrite')} 
          disabled={isExecuting}
          title="다시쓰기"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
      </div>
      
      {(result || error || isExecuting) && (
        <div className={styles.floatingResult}>
          {isExecuting && <div className={styles.loading}>처리 중...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {result && !isExecuting && <div className={styles.resultText}>{result}</div>}
        </div>
      )}
    </div>
  );
};

export default FloatingUI; 