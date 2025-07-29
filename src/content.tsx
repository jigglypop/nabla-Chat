import ReactDOM from 'react-dom/client'
import ChatApp from './containers/ChatApp/ChatApp'
import styles from './content.module.css'
import { Provider } from 'jotai'
import { store } from './atoms/store'
import { chatOpenAtom } from './atoms/chatAtoms'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { MessageType } from './types/message'

let chatRoot: ReactDOM.Root | null = null
let chatContainer: HTMLElement | null = null
let chatButtonContainer: HTMLElement | null = null
const queryClient = new QueryClient()

// 전역 중복 실행 방지 플래그
declare global {
 interface Window {
  __nabla_chat_initialized?: boolean
 }
}

function createChatButton() {
  if (window.__nabla_chat_initialized || chatButtonContainer) return
  window.__nabla_chat_initialized = true
  // 버튼 래퍼
  chatButtonContainer = document.createElement('div')
  chatButtonContainer.id = 'nabla-chat-button'
  Object.assign(chatButtonContainer.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    zIndex: '2147483640',
  })
  // 버튼
  const button = document.createElement('button')
  button.className = styles.chatButton
  const chatIcon = document.createElement('span')
  chatIcon.className = `${styles.icon} ${styles.chatEmoji}`
  chatIcon.textContent = '💬'
  const closeIcon = document.createElement('span')
  closeIcon.className = `${styles.icon} ${styles.closeEmoji}`
  closeIcon.textContent = '✖'
  closeIcon.style.display = 'none'
  button.append(chatIcon, closeIcon)
  chatButtonContainer.append(button)
  document.body.append(chatButtonContainer)
  button.addEventListener('click', toggleChat)
}

function toggleChat() {
 if (chatContainer) {
  closeChatInterface()
 } else {
  openChatInterface()
 }
}

function openChatInterface(selectedText?: string) {
  if (chatContainer) return
  chatContainer = document.createElement('div')
  chatContainer.id = 'nabla-chat-app'
  document.body.appendChild(chatContainer)
  chatRoot = ReactDOM.createRoot(chatContainer)
  chatRoot.render(
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
    <ChatApp onClose={closeChatInterface} />
    </Provider>
  </QueryClientProvider>
  )
  store.set(chatOpenAtom, true)
  updateButtonIcon()
  if (selectedText) {
  setTimeout(() => {
    window.postMessage({ type: 'SEND_TO_CHAT', text: selectedText }, '*')
  }, 300)
  }
}

function closeChatInterface() {
 if (chatRoot) {
  chatRoot.unmount()
  chatRoot = null
 }
 if (chatContainer) {
  chatContainer.remove()
  chatContainer = null
 }
 store.set(chatOpenAtom, false)
 updateButtonIcon()
}

function updateButtonIcon() {
 const chatEmoji = chatButtonContainer?.querySelector<HTMLElement>(`.${styles.chatEmoji}`)
 const closeEmoji = chatButtonContainer?.querySelector<HTMLElement>(`.${styles.closeEmoji}`)
 if (!chatEmoji || !closeEmoji) return

 if (chatContainer) {
  chatEmoji.style.display = 'none'
  closeEmoji.style.display = 'inline'
 } else {
  chatEmoji.style.display = 'inline'
  closeEmoji.style.display = 'none'
 }
}

function resizeChatWindow(direction: 'larger' | 'smaller') {
  if (!chatContainer) return
  window.postMessage({ type: 'RESIZE_CHAT', direction }, '*')
}

if (chrome.runtime?.onMessage) {
 chrome.runtime.onMessage.addListener((message: MessageType) => {
  if (message.type === 'COMMAND' && message.payload?.command) {
   switch (message.payload.command) {
    case 'toggle-chat':
     toggleChat()
     break
    case 'resize-larger':
     resizeChatWindow('larger')
     break
    case 'resize-smaller':
     resizeChatWindow('smaller')
     break
   }
  }
 })
}

if (!window.__nabla_chat_initialized) {
 if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChatButton)
 } else {
  createChatButton()
 }
}
