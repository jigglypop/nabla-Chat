import React, { useState, useEffect, useRef } from 'react'
import styles from './ChatApp.module.css'
import type { ChatAppProps, Message } from './types'

const ChatApp: React.FC<ChatAppProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! Lovebug AI 어시스턴트입니다. 무엇을 도와드릴까요?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chatSize, setChatSize] = useState(() => {
    const saved = localStorage.getItem('lovebug-chat-size')
    return saved ? JSON.parse(saved) : { width: 420, height: 600 }
  })
  const [chatPosition, setChatPosition] = useState(() => {
    const saved = localStorage.getItem('lovebug-chat-position')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        x: Math.max(0, Math.min(window.innerWidth - 420, parsed.x)),
        y: Math.max(0, Math.min(window.innerHeight - 600, parsed.y))
      }
    }
    return {
      x: typeof window !== 'undefined' ? Math.max(0, window.innerWidth - 440) : 20,
      y: typeof window !== 'undefined' ? Math.max(0, window.innerHeight - 620) : 20
    }
  })
  const [isResizing, setIsResizing] = useState<string | false>(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SEND_TO_CHAT' && event.data.text) {
        setInput(event.data.text)
        setTimeout(() => {
          handleSend()
        }, 100)
      } else if (event.data.type === 'RESIZE_CHAT' && event.data.direction) {
        // 크기 조절 단축키 처리
        setChatSize((prevSize: { width: number, height: number }) => {
          const step = 50
          let newWidth, newHeight
          
          if (event.data.direction === 'larger') {
            newWidth = Math.min(window.innerWidth - 40, prevSize.width + step)
            newHeight = Math.min(window.innerHeight - 40, prevSize.height + step)
          } else {
            newWidth = Math.max(320, prevSize.width - step)
            newHeight = Math.max(400, prevSize.height - step)
          }
          
          // 크기가 변경되면 위치도 조정해야 할 수 있음
          setChatPosition((prevPos: { x: number, y: number }) => {
            // 화면 경계를 벗어나지 않도록 위치 조정
            const newX = Math.min(prevPos.x, window.innerWidth - newWidth)
            const newY = Math.min(prevPos.y, window.innerHeight - newHeight)
            return { x: Math.max(0, newX), y: Math.max(0, newY) }
          })
          
          return { width: newWidth, height: newHeight }
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [input]) 

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const containerRect = containerRef.current?.getBoundingClientRect()
        if (!containerRect) return
        let newWidth = chatSize.width
        let newHeight = chatSize.height
        let newX = chatPosition.x
        let newY = chatPosition.y
        // 각 방향별 리사이징 처리
        if (isResizing.includes('right')) {
          newWidth = e.clientX - containerRect.left
        }
        if (isResizing.includes('left')) {
          const delta = containerRect.left - e.clientX
          newWidth = chatSize.width + delta
          newX = chatPosition.x - delta
        }
        if (isResizing.includes('bottom')) {
          newHeight = e.clientY - containerRect.top
        }
        if (isResizing.includes('top')) {
          const delta = containerRect.top - e.clientY
          newHeight = chatSize.height + delta
          newY = chatPosition.y - delta
        }
        const finalWidth = Math.max(320, Math.min(window.innerWidth - 40, newWidth))
        const finalHeight = Math.max(400, Math.min(window.innerHeight - 40, newHeight))
        if (isResizing.includes('left') && finalWidth !== newWidth) {
          newX = chatPosition.x + (chatSize.width - finalWidth)
        }
        if (isResizing.includes('top') && finalHeight !== newHeight) {
          newY = chatPosition.y + (chatSize.height - finalHeight)
        }
        // 화면 경계 체크
        const finalX = Math.max(0, Math.min(window.innerWidth - finalWidth, newX))
        const finalY = Math.max(0, Math.min(window.innerHeight - finalHeight, newY))
        setChatSize({ width: finalWidth, height: finalHeight })
        setChatPosition({ x: finalX, y: finalY })
      } else if (isDragging) {
        const newX = e.clientX - dragStart.x
        const newY = e.clientY - dragStart.y
        // 화면 밖으로 나가지 않도록 제한
        setChatPosition({
          x: Math.max(0, Math.min(window.innerWidth - chatSize.width, newX)),
          y: Math.max(0, Math.min(window.innerHeight - chatSize.height, newY))
        })
      }
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      setIsDragging(false)
    }
    if (isResizing || isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = isResizing ? (isResizing + '-resize') : 'move'
      document.body.style.userSelect = 'none'
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, isDragging, dragStart, chatSize, chatPosition])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '목업용 대화입니다!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }



  useEffect(() => {
    localStorage.setItem('lovebug-chat-size', JSON.stringify(chatSize))
  }, [chatSize])
  
  useEffect(() => {
    localStorage.setItem('lovebug-chat-position', JSON.stringify(chatPosition))
  }, [chatPosition])
  
  useEffect(() => {
    const handleResize = () => {
      setChatPosition((prev: { x: number, y: number }) => ({
        x: Math.max(0, Math.min(window.innerWidth - chatSize.width, prev.x)),
        y: Math.max(0, Math.min(window.innerHeight - chatSize.height, prev.y))
      }))
      setChatSize((prev: { width: number, height: number }) => ({
        width: Math.min(window.innerWidth - 40, prev.width),
        height: Math.min(window.innerHeight - 40, prev.height)
      }))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [chatSize.width, chatSize.height])

  return (
    <>
      {/* 크기 조절 핸들들 */}
      <div className={`${styles.resizeHandle} ${styles.resizeTop}`} onMouseDown={() => setIsResizing('top')} />
      <div className={`${styles.resizeHandle} ${styles.resizeRight}`} onMouseDown={() => setIsResizing('right')} />
      <div className={`${styles.resizeHandle} ${styles.resizeBottom}`} onMouseDown={() => setIsResizing('bottom')} />
      <div className={`${styles.resizeHandle} ${styles.resizeLeft}`} onMouseDown={() => setIsResizing('left')} />
      <div className={`${styles.resizeHandle} ${styles.resizeTopLeft}`} onMouseDown={() => setIsResizing('top-left')} />
      <div className={`${styles.resizeHandle} ${styles.resizeTopRight}`} onMouseDown={() => setIsResizing('top-right')} />
      <div className={`${styles.resizeHandle} ${styles.resizeBottomLeft}`} onMouseDown={() => setIsResizing('bottom-left')} />
      <div className={`${styles.resizeHandle} ${styles.resizeBottomRight}`} onMouseDown={() => setIsResizing('bottom-right')} />
    </>
  )
}

export default ChatApp 