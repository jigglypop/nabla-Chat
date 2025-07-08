import { useState, useEffect, useRef } from "react"
import ChatApp from "./components/ChatApp/ChatApp"
import FloatingUI from "./components/FloatingUI/FloatingUI"
import styles from "./content.module.css"
import "./font.module.css"

function App() {
  const [showFloating, setShowFloating] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [floatingPosition, setFloatingPosition] = useState({ x: 0, y: 0 })
  const [showPopup, setShowPopup] = useState(false)
  const textAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        const text = selection.toString().trim()
        if (text && textAreaRef.current?.contains(selection.anchorNode)) {
          setSelectedText(text)
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          setFloatingPosition({
            x: rect.left,
            y: rect.bottom + 10
          })
          setShowFloating(true)
        }
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (!document.getElementById('floating-ui')?.contains(target)) {
        setShowFloating(false)
      }
    }

    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousedown', handleMouseDown)

    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return (
    <div className={styles.testContainer}>
      <h1 className={styles.testTitle}>Lovebug Extension Test</h1>
      
      {/* 크롬 확장 프로그램 시뮬레이션 */}
      <div className={styles.chromeBar}>
        <span className={styles.chromeBarTitle}>Chrome Browser</span>
        <div 
          className={styles.extensionIcon} 
          title="Lovebug Extension"
          onClick={() => setShowPopup(!showPopup)}
        >
          <svg width="24" height="24" viewBox="0 0 128 128" fill="currentColor">
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
      </div>

      {/* Extension Popup */}
      {showPopup && (
        <div className={styles.extensionPopup}>
          <div className={styles.popupHeader}>
            <h3>Lovebug Assistant</h3>
            <button onClick={() => setShowPopup(false)}>×</button>
          </div>
          <div className={styles.popupContent}>
            <p>AI-powered browser assistant</p>
            <div className={styles.popupActions}>
              <button onClick={() => { setShowChat(true); setShowPopup(false); }}>
                Open Chat
              </button>
              <button>Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* 테스트 영역 */}
      <div className={styles.testContent}>
        <div className={styles.testSection}>
          <h2>1. 텍스트 드래그 테스트</h2>
          <div ref={textAreaRef} className={styles.dragArea}>
            <p>이 텍스트를 드래그해보세요. Lovebug Extension은 선택한 텍스트에 대해 AI 기반의 다양한 기능을 제공합니다. 
            텍스트를 선택하면 플로팅 UI가 나타나며, 요약, 번역, 설명, 다시 쓰기 등의 기능을 사용할 수 있습니다.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>
        </div>

        <div className={styles.testSection}>
          <h2>2. 채팅 버튼 테스트</h2>
          <button 
            className={`${styles.chatButton} ${showChat ? styles.chatOpen : ''}`}
            onClick={() => setShowChat(!showChat)}
          >
            <span className={styles.chatButtonOverlay}></span>
            <svg className={`${styles.chatIcon} chat-icon`} width="24" height="24" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <svg className={`${styles.closeIcon} close-icon`} width="24" height="24" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Floating UI */}
      {showFloating && (
        <div 
          id="floating-ui"
          style={{
            position: 'fixed',
            left: `${floatingPosition.x}px`,
            top: `${floatingPosition.y}px`,
            zIndex: 1000
          }}
        >
          <FloatingUI 
            selectedText={selectedText} 
            onClose={() => setShowFloating(false)}
          />
        </div>
      )}

      {/* Chat App */}
      {showChat && (
        <ChatApp onClose={() => setShowChat(false)} />
      )}
    </div>
  )
}

export default App
