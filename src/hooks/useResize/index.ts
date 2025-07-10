import { useState, useRef } from 'react'

const useResize = () => {
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
    const containerRef = useRef<HTMLDivElement>(null)

    const onMouseMove = (e: MouseEvent) => {
        if (isResizing) {
            const containerRect = containerRef.current?.getBoundingClientRect()
            if (!containerRect) return
            let newWidth = chatSize.width
            let newHeight = chatSize.height
            let newX = chatPosition.x
            let newY = chatPosition.y
            if (isResizing.includes('right')) newWidth = e.clientX - containerRect.left
            if (isResizing.includes('left')) {
                const delta = containerRect.left - e.clientX
                newWidth = chatSize.width + delta
                newX = chatPosition.x - delta
            }
            if (isResizing.includes('bottom')) newHeight = e.clientY - containerRect.top
            if (isResizing.includes('top')) {
                const delta = containerRect.top - e.clientY
                newHeight = chatSize.height + delta
                newY = chatPosition.y - delta
            }
            const finalWidth = Math.max(320, Math.min(window.innerWidth - 40, newWidth))
            const finalHeight = Math.max(400, Math.min(window.innerHeight - 40, newHeight))
            if (isResizing.includes('left') && finalWidth !== newWidth) newX = chatPosition.x + (chatSize.width - finalWidth)
            if (isResizing.includes('top') && finalHeight !== newHeight)  newY = chatPosition.y + (chatSize.height - finalHeight)
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

    const onMouseUp = () => {
        setIsResizing(false)
        setIsDragging(false)
    }
    const onResize = () => {
        setChatPosition((prev: { x: number, y: number }) => ({
            x: Math.max(0, Math.min(window.innerWidth - chatSize.width, prev.x)),
            y: Math.max(0, Math.min(window.innerHeight - chatSize.height, prev.y))
        }))
        setChatSize((prev: { width: number, height: number }) => ({
            width: Math.min(window.innerWidth - 40, prev.width),
            height: Math.min(window.innerHeight - 40, prev.height)
        }))
    }
    return {
        isDragging,
        setIsDragging,
        isResizing,
        setIsResizing,
        chatPosition,
        setChatPosition,
        chatSize,
        setChatSize,
        onMouseMove,
        onMouseUp,
        onResize,
        dragStart,
        setDragStart,
        containerRef
    }
}

export default useResize