import React, { useState, useEffect, useRef } from 'react'
import styles from './FloatingUI.module.css'

interface FloatingUIProps {
  selectedText: string
  onClose: () => void
}

const FloatingUI: React.FC<FloatingUIProps> = ({ selectedText, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  const [isMouseOver, setIsMouseOver] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsCtrlPressed(true)
        setIsExpanded(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsCtrlPressed(false)
        if (!isMouseOver) {
          setIsExpanded(false)
        }
      }
    }
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'TOGGLE_FLOATING_UI') {
        setIsExpanded(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('message', handleMessage)
    }
  }, [isMouseOver])

  const handleMouseEnter = () => {
    setIsMouseOver(true)
    setIsExpanded(true)
  }

  const handleMouseLeave = () => {
    setIsMouseOver(false)
    if (!isCtrlPressed) {
      setTimeout(() => {
        if (!isMouseOver && !isCtrlPressed) {
          setIsExpanded(false)
        }
      }, 300)
    }
  }

  if (!isExpanded) {
    return (
      <div 
        ref={containerRef}
        className={styles.compactContainer}
        onMouseEnter={handleMouseEnter}
      >
        <div className={styles.compactButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </div>
        <span className={styles.tooltip}>AI 도구 (Ctrl 키로 확장)</span>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <h3 className={styles.title}>Lovebug Assistant</h3>
          <span className={styles.subtitle}>AI-powered productivity</span>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.854 4.854a.5.5 0 0 0 0-.708l-.708-.708a.5.5 0 0 0-.708 0L8 6.793 4.646 3.438a.5.5 0 0 0-.708 0l-.708.708a.5.5 0 0 0 0 .708L6.586 8l-3.354 3.354a.5.5 0 0 0 0 .708l.708.708a.5.5 0 0 0 .708 0L8 9.414l3.354 3.354a.5.5 0 0 0 .708 0l.708-.708a.5.5 0 0 0 0-.708L9.414 8l3.354-3.354z"/>
          </svg>
        </button>
      </div>
      <div className={styles.content}>
        {selectedText.length > 100 
          ? `${selectedText.substring(0, 100)}...` 
          : selectedText}
      </div>
      <div className={styles.actions}>
        <button className={styles.actionButton} title="요약하기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/>
          </svg>
          <span>요약</span>
        </button>
        <button className={styles.actionButton} title="번역하기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
          </svg>
          <span>번역</span>
        </button>
        <button className={styles.actionButton} title="설명하기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
          </svg>
          <span>설명</span>
        </button>
        <button className={styles.actionButton} title="다시 쓰기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          <span>다시쓰기</span>
         </button>
      </div>
    </div>
  )
}

export default FloatingUI 