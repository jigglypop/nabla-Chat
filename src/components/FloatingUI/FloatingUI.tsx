import React from 'react'
import styles from './FloatingUI.module.css'

interface FloatingUIProps {
  selectedText: string
  onClose: () => void
}

const FloatingUI: React.FC<FloatingUIProps> = ({ selectedText, onClose }) => {
  return (
    <div className={styles.container}>
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
    </div>
  )
}

export default FloatingUI 