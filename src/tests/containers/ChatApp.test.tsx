import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import userEvent from '@testing-library/user-event'
import ChatApp from '../../containers/ChatApp/ChatApp'

describe('ChatApp 컴포넌트 테스트', () => {
  const mockOnClose = vi.fn()
  const user = userEvent.setup({ pointerEventsCheck: 0 })

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.spyOn(window, 'postMessage').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('렌더링', () => {
    it('채팅 앱이 올바르게 렌더링되어야 함', () => {
      render(<ChatApp onClose={mockOnClose} />)
      expect(screen.getByText('러브버그챗')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('메시지를 입력하세요')).toBeInTheDocument()
    })

    it('저장된 크기와 위치를 복원해야 함', () => {
      // window 크기를 충분히 크게 설정
      Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
      Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true })
      
      localStorage.setItem('lovebug-chat-size', JSON.stringify({ width: 500, height: 700 }))
      localStorage.setItem('lovebug-chat-position', JSON.stringify({ x: 100, y: 200 }))
      
      const { container } = render(<ChatApp onClose={mockOnClose} />)
      const chatContainer = container.firstChild as HTMLElement
      
      expect(chatContainer.style.width).toBe('500px')
      expect(chatContainer.style.height).toBe('700px')
      expect(chatContainer.style.left).toBe('100px')
      expect(chatContainer.style.top).toBe('200px')
    })
  })

  describe('메시지 전송', () => {
    it('메시지를 전송할 수 있어야 함', async () => {
      render(<ChatApp onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText('메시지를 입력하세요')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, '테스트 메시지')
      await user.click(sendButton)
      
      await waitFor(() => {
        expect(screen.getByText('테스트 메시지')).toBeInTheDocument()
      })
    })

    it('로딩 중에는 전송 버튼이 비활성화되어야 함', async () => {
      render(<ChatApp onClose={mockOnClose} />)
      const input = screen.getByPlaceholderText('메시지를 입력하세요')
      const sendButton = screen.getByTestId('send-button')
      
      await user.type(input, '테스트')
      await user.click(sendButton)
      
      expect(sendButton).toBeDisabled()
      
      await waitFor(() => {
        expect(sendButton).not.toBeDisabled()
      }, { timeout: 2000 })
    })
  })

  describe('창 제어', () => {
    it('닫기 버튼 클릭 시 onClose가 호출되어야 함', async () => {
      render(<ChatApp onClose={mockOnClose} />)
      const closeButton = screen.getByTestId('close-button')
      await user.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('최소화/최대화를 토글할 수 있어야 함', async () => {
      const { container } = render(<ChatApp onClose={mockOnClose} />)
      const minimizeButton = screen.getByTestId('minimize-button')

      await user.click(minimizeButton)
      expect(container.firstChild).toHaveClass('minimized')
      
      await user.click(minimizeButton)
      expect(container.firstChild).not.toHaveClass('minimized')
    })
  })

  describe('외부 메시지 처리', () => {
    it('SEND_TO_CHAT 메시지를 처리해야 함', async () => {
      render(<ChatApp onClose={mockOnClose} />)
      
      act(() => {
        window.dispatchEvent(new MessageEvent('message', {
          data: { type: 'SEND_TO_CHAT', text: '외부 텍스트' }
        }))
      })

      await waitFor(() => {
        const input = screen.getByPlaceholderText('메시지를 입력하세요') as HTMLTextAreaElement
        expect(input.value).toContain('외부 텍스트')
      })
    })
  })
  
  describe('드래그 및 리사이즈', () => {
    it('헤더를 드래그하여 창을 이동할 수 있어야 함', () => {
      const { container } = render(<ChatApp onClose={mockOnClose} />)
      const header = container.querySelector('.' + CSS.escape('header')) as HTMLElement
      const chatContainer = container.firstChild as HTMLElement
      
      const initialLeft = chatContainer.style.left
      const initialTop = chatContainer.style.top
      
      if (header) {
        fireEvent.mouseDown(header, { clientX: 100, clientY: 100 })
        fireEvent.mouseMove(document, { clientX: 200, clientY: 150 })
        fireEvent.mouseUp(document)
        
        expect(chatContainer.style.left).not.toBe(initialLeft)
        expect(chatContainer.style.top).not.toBe(initialTop)
      }
    })

    it('리사이즈 핸들로 크기를 조절할 수 있어야 함', () => {
      const { container } = render(<ChatApp onClose={mockOnClose} />)
      const resizeHandle = container.querySelector('.' + CSS.escape('resizeRight')) as HTMLElement
      const chatContainer = container.firstChild as HTMLElement
      
      const initialWidth = chatContainer.style.width
      
      if (resizeHandle) {
        fireEvent.mouseDown(resizeHandle, { clientX: 420 })
        fireEvent.mouseMove(document, { clientX: 500 })
        fireEvent.mouseUp(document)
        
        expect(chatContainer.style.width).not.toBe(initialWidth)
      }
    })
  })
}) 