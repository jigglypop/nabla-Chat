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
      <h1 className={styles.testTitle}>LOVEBUG SETTINGS</h1>
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
