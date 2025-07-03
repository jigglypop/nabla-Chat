import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function App() {
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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    simulateResponse()
  }

  const simulateResponse = () => {
    setIsLoading(true)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a mock response. Connect to your AI API for real responses!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="lb-max-w-4xl lb-mx-auto lb-h-screen lb-p-4">
      <div className="lb-bg-bg-secondary lb-rounded-2xl lb-shadow-2xl lb-h-full lb-flex lb-flex-col lb-overflow-hidden">
        <div className="lb-bg-gradient-to-r lb-from-lovebug-primary lb-via-lovebug-secondary lb-to-lovebug-tertiary lb-p-4 lb-text-white">
          <div className="lb-flex lb-items-center lb-gap-3">
            <img src="./icon.svg" alt="Lovebug Logo" className="lb-w-8 lb-h-8" />
            <h1 className="lb-text-xl lb-font-bold">Lovebug Chat</h1>
          </div>
          <div className="lb-flex lb-gap-2 lb-mt-2">
            <button className="lb-p-2 lb-bg-white/10 lb-rounded-lg lb-backdrop-blur-sm hover:lb-bg-white/20 lb-transition-colors" title="Settings">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.035 2.23a2 2 0 0 1 3.93 0l.393 1.439a2 2 0 0 0 1.195 1.348l1.452.363a2 2 0 0 1 1.382 3.68l-1.06 1.06a2 2 0 0 0 0 2.828l1.06 1.06a2 2 0 0 1-1.382 3.68l-1.452.363a2 2 0 0 0-1.195 1.348l-.393 1.44a2 2 0 0 1-3.93 0l-.393-1.44a2 2 0 0 0-1.195-1.348l-1.452-.363a2 2 0 0 1-1.382-3.68l1.06-1.06a2 2 0 0 0 0-2.828l-1.06-1.06A2 2 0 0 1 5.39 5.04l1.452-.363a2 2 0 0 0 1.195-1.348l.393-1.44zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="lb-flex-1 lb-overflow-y-auto lb-p-6 lb-bg-bg-primary">
          {messages.map((message, index) => (
            <div key={index} className={`lb-flex lb-gap-3 lb-mb-4 ${message.role === 'user' ? 'lb-flex-row-reverse' : ''}`}>
              <div className="lb-w-10 lb-h-10 lb-rounded-full lb-bg-gradient-to-br lb-from-lovebug-primary lb-to-lovebug-secondary lb-flex lb-items-center lb-justify-center lb-text-white lb-font-semibold">
                {message.role === 'user' ? 'U' : 'A'}
              </div>
              <div className={`lb-max-w-[70%] lb-rounded-2xl lb-p-4 ${
                message.role === 'user' 
                  ? 'lb-bg-accent-primary lb-text-white lb-rounded-br-sm' 
                  : 'lb-bg-bg-secondary lb-border lb-border-border-secondary lb-rounded-bl-sm'
              }`}>
                <div className="lb-text-sm">{message.content}</div>
                <div className="lb-text-xs lb-mt-1 lb-opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="lb-flex lb-gap-3 lb-mb-4">
              <div className="lb-w-10 lb-h-10 lb-rounded-full lb-bg-gradient-to-br lb-from-lovebug-primary lb-to-lovebug-secondary lb-flex lb-items-center lb-justify-center lb-text-white lb-font-semibold">A</div>
              <div className="lb-max-w-[70%] lb-rounded-2xl lb-rounded-bl-sm lb-p-4 lb-bg-bg-secondary lb-border lb-border-border-secondary">
                <div className="lb-flex lb-gap-1">
                  <span className="lb-w-2 lb-h-2 lb-bg-text-secondary lb-rounded-full lb-animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="lb-w-2 lb-h-2 lb-bg-text-secondary lb-rounded-full lb-animate-bounce" style={{ animationDelay: '200ms' }}></span>
                  <span className="lb-w-2 lb-h-2 lb-bg-text-secondary lb-rounded-full lb-animate-bounce" style={{ animationDelay: '400ms' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="lb-p-4 lb-bg-bg-secondary lb-border-t lb-border-border-secondary">
          <form onSubmit={handleSubmit} className="lb-flex lb-gap-3">
            <input
              className="lb-flex-1 lb-px-4 lb-py-3 lb-bg-bg-tertiary lb-border lb-border-border-primary lb-rounded-xl lb-text-text-primary lb-outline-none focus:lb-border-accent-primary focus:lb-ring-2 focus:lb-ring-accent-primary/20 lb-transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              className="lb-px-6 lb-py-3 lb-bg-gradient-to-r lb-from-lovebug-primary lb-via-lovebug-secondary lb-to-lovebug-tertiary lb-text-white lb-rounded-xl lb-font-medium hover:lb-opacity-90 disabled:lb-opacity-50 lb-transition-opacity"
              type="submit"
              disabled={!input.trim() || isLoading}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default App
