import React, { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface ChatInterfaceProps {
  initialText?: string
  onClose: () => void
  onBack: () => void
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ initialText, onClose, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (initialText) {
      const initMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Please help me with this text: "${initialText}"`,
        timestamp: new Date()
      }
      setMessages([initMessage])
      sendMessage(initMessage.content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (content?: string) => {
    await sendMessage(content || input.trim())
  }

  const sendMessage = async (messageContent: string) => {
    if (!messageContent) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      const apiEndpoint = await getApiEndpoint()
      
      if (!apiEndpoint) {
        await mockStreamResponse(messageContent, assistantMessage.id)
      } else {
        await streamResponse(messageContent, assistantMessage.id)
      }
    } catch (error) {
      console.error('Failed to get response:', error)
      updateMessage(assistantMessage.id, 'Sorry, I encountered an error. Please try again.')
    } finally {
      setIsLoading(false)
      updateMessageStreaming(assistantMessage.id, false)
    }
  }

  const mockStreamResponse = async (_prompt: string, messageId: string) => {
    const mockResponses = [
      "I understand you need help with that text. Let me analyze it for you...",
      "Based on the content you've shared, here are my insights:",
      "This is a great question! Let me provide you with a comprehensive answer.",
      "I'd be happy to assist you with this. Here's what I think:"
    ]
    
    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)] +
      "\n\n" +
      "This is a mock response for testing purposes. When connected to a real API, " +
      "I'll provide actual AI-powered responses to help you with text summarization, " +
      "translation, rewriting, and more. Feel free to test the chat interface!"
    
    for (let i = 0; i < response.length; i += 3) {
      await new Promise(resolve => setTimeout(resolve, 20))
      updateMessage(messageId, response.substring(0, i + 3))
    }
  }

  const streamResponse = async (prompt: string, messageId: string) => {
    const eventSource = new EventSource(
      `${await getApiEndpoint()}/chat/completions?prompt=${encodeURIComponent(prompt)}`,
      { withCredentials: true }
    )

    eventSource.onmessage = (event) => {
      const data = event.data
      if (data === '[DONE]') {
        eventSource.close()
        return
      }

      try {
        const parsed = JSON.parse(data)
        if (parsed.content) {
          updateMessage(messageId, parsed.content, true)
        }
      } catch (e) {
        console.error('Failed to parse SSE data:', e)
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      updateMessage(messageId, 'Connection error. Please try again.')
    }
  }

  const getApiEndpoint = async (): Promise<string> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['apiEndpoint'], (result) => {
        resolve(result.apiEndpoint || '')
      })
    })
  }

  const updateMessage = (id: string, content: string, append = false) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id 
        ? { ...msg, content: append ? msg.content + content : content }
        : msg
    ))
  }

  const updateMessageStreaming = (id: string, isStreaming: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, isStreaming } : msg
    ))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          </svg>
          Back
        </button>
        <h3>Lovebug Chat</h3>
        <button className="close-btn" onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.854 4.854a.5.5 0 0 0 0-.708l-.708-.708a.5.5 0 0 0-.708 0L8 6.793 4.646 3.438a.5.5 0 0 0-.708 0l-.708.708a.5.5 0 0 0 0 .708L6.586 8l-3.354 3.354a.5.5 0 0 0 0 .708l.708.708a.5.5 0 0 0 .708 0L8 9.414l3.354 3.354a.5.5 0 0 0 .708 0l.708-.708a.5.5 0 0 0 0-.708L9.414 8l3.354-3.354z"/>
          </svg>
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="welcome-icon">💬</div>
            <h4>Welcome to Lovebug Chat!</h4>
            <p>Ask me anything or select text on the page to get started.</p>
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.content}
                {message.isStreaming && <span className="typing-indicator">▋</span>}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          ref={inputRef}
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={1}
        />
        <button 
          className="send-btn" 
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <span className="loading-spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.925 5.025l14.357-4.821a.75.75 0 0 1 .952.952l-4.821 14.357a.75.75 0 0 1-1.417-.064l-2.046-6.129a.25.25 0 0 0-.156-.156L3.665 7.118a.75.75 0 0 1-.064-1.417l.324-.109z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

export default ChatInterface 