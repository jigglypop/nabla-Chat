// import { useState, useRef } from 'react'
// import type { Message } from './types'
// 
// 
// const useMessage = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       role: 'assistant',
//       content: '안녕하세요! Lovebug AI 어시스턴트입니다. 무엇을 도와드릴까요?',
//       timestamp: new Date()
//     }
//   ])
//   const [input, setInput] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const messagesEndRef = useRef<HTMLDivElement>(null)
// 
//   const scrollToBottom = () => {
//    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
//   }
// 
//   const onSend = async (e: KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       if (!input.trim() || isLoading) return
//       const userMessage: Message = {
//         id: Date.now().toString(),
//         role: 'user',
//         content: input.trim(),
//         timestamp: new Date()
//       }
//       setMessages(prev => [...prev, userMessage])
//       setInput('')
//       setIsLoading(true)
//       setTimeout(() => {
//         const aiMessage: Message = {
//           id: (Date.now() + 1).toString(),
//           role: 'assistant',
//           content: '목업용 대화입니다!',
//           timestamp: new Date()
//         }
//         setMessages(prev => [...prev, aiMessage])
//         setIsLoading(false)
//       }, 1000)
//     }
//   }
// 
//   return {
//     input,
//     setInput,
//     isLoading,
//     setIsLoading,
//     scrollToBottom,
//     messages,
//     setMessages,
//     onSend
//   }
//   
// }
// 
// export default useMessage