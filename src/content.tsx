import React from 'react'
import ReactDOM from 'react-dom/client'
import type { Message } from './types'
import ChatApp from './containers/ChatApp/ChatApp'
import styles from './content.module.css'
import { Provider } from 'jotai'
import { store } from './atoms/store'
import { chatOpenAtom } from './atoms/chatAtoms'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let chatRoot: ReactDOM.Root | null = null
let chatContainer: HTMLElement | null = null
let chatButtonContainer: HTMLElement | null = null
const queryClient = new QueryClient()

function createChatButton() {
  if (chatButtonContainer) return
  chatButtonContainer = document.createElement('div')
  chatButtonContainer.id = 'nabla-chat-button'
  // 인라인 스타일로 position fixed 보장
  chatButtonContainer.style.position = 'fixed'
  chatButtonContainer.style.bottom = '30px'
  chatButtonContainer.style.right = '30px'
  chatButtonContainer.style.zIndex = '2147483640'
  const button = document.createElement('button')
  button.className = styles.chatButton
  const overlay = document.createElement('span')
  overlay.className = styles.chatButtonOverlay
  // 채팅 아이콘 이미지
  const chatIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  chatIcon.setAttribute('viewBox','0 0 24 24')
  chatIcon.setAttribute('width','24')
  chatIcon.setAttribute('height','24')
  chatIcon.setAttribute('class', `${styles.chatButtonImage} ${styles.chatIcon} chat-icon`)
  chatIcon.innerHTML = '<path d="M4 4h16v10H5.17L4 15.17V4z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>'
  // 버튼 색상을 흰색으로
  chatIcon.style.color = '#ffffff'
  // 닫기 아이콘 (SVG 유지)
  const closeIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  closeIcon.setAttribute('class', `${styles.closeIcon} close-icon`)
  closeIcon.setAttribute('width', '24')
  closeIcon.setAttribute('height', '24')
  closeIcon.setAttribute('viewBox', '0 0 24 24')
  closeIcon.innerHTML = '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>'
  
  button.appendChild(overlay)
  button.appendChild(chatIcon)
  button.appendChild(closeIcon)
  chatButtonContainer.appendChild(button)
  document.body.appendChild(chatButtonContainer)
  button.addEventListener('click', toggleChat)
}

function toggleChat() {
  if (store.get(chatOpenAtom)) {
    closeChatInterface()
  } else {
    openChatInterface()
  }
}

function openChatInterface(selectedText?: string) {
  // 기존 채팅 컨테이너가 있으면 제거
  if (chatContainer) {
    closeChatInterface()
  }
  
  chatContainer = document.createElement('div')
  chatContainer.id = 'nabla-chat-app'
  document.body.appendChild(chatContainer)
  chatRoot = ReactDOM.createRoot(chatContainer)
  chatRoot.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ChatApp onClose={closeChatInterface} />
        </Provider>
      </QueryClientProvider>
    </React.StrictMode>
  )
  store.set(chatOpenAtom, true)
  updateButtonIcon()

  if (selectedText) {
    setTimeout(() => {
      window.postMessage({
        type: 'SEND_TO_CHAT',
        text: selectedText,
      }, '*')
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
  const button = chatButtonContainer?.querySelector('button')

  if (button) {
    if (store.get(chatOpenAtom)) {
      button.classList.add(styles.chatOpen)
      chatButtonContainer!.style.visibility = 'hidden'
    } else {
      button.classList.remove(styles.chatOpen)
      chatButtonContainer!.style.visibility = 'visible'
    }
  }
}

function resizeChatWindow(direction: 'larger' | 'smaller') {
  if (!store.get(chatOpenAtom) || !chatRoot) return

  window.postMessage({
    type: 'RESIZE_CHAT',
    direction: direction,
  }, '*')
}

if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type === 'COMMAND' && message.payload?.command) {
      const command = message.payload.command;
      switch (command) {
        case 'toggle-chat':
          toggleChat();
          break;
        case 'resize-larger':
          resizeChatWindow('larger');
          break;
        case 'resize-smaller':
          resizeChatWindow('smaller');
          break;
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChatButton)
} else {
  createChatButton()
}