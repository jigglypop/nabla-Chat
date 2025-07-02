import React from 'react'
import ReactDOM from 'react-dom/client'
import type { Message, SelectionInfo } from './types'
import FloatingUI from './components/FloatingUI'
import ChatApp from './components/ChatApp'
import './content.css'

let floatingUIRoot: ReactDOM.Root | null = null
let floatingUIContainer: HTMLElement | null = null
let chatRoot: ReactDOM.Root | null = null
let chatContainer: HTMLElement | null = null
let chatButtonContainer: HTMLElement | null = null
let chatOpen = false

function createChatButton() {
  if (chatButtonContainer) return
  
  chatButtonContainer = document.createElement('div')
  chatButtonContainer.id = 'lovebug-chat-button'
  chatButtonContainer.innerHTML = `
    <button class="lovebug-fab">
      <svg class="chat-icon" width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
      <svg class="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="white" style="display: none;">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  `
  
  document.body.appendChild(chatButtonContainer)
  
  chatButtonContainer.querySelector('button')?.addEventListener('click', toggleChat)
}

function toggleChat() {
  if (chatOpen) {
    closeChatInterface()
  } else {
    openChatInterface()
  }
}

function openChatInterface() {
  removeFloatingUI()
  
  if (chatContainer) return
  
  chatContainer = document.createElement('div')
  chatContainer.id = 'lovebug-chat-wrapper'
  document.body.appendChild(chatContainer)
  
  chatRoot = ReactDOM.createRoot(chatContainer)
  chatRoot.render(
    <React.StrictMode>
      <ChatApp onClose={closeChatInterface} />
    </React.StrictMode>
  )
  
  chatOpen = true
  updateButtonIcon()
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
  chatOpen = false
  updateButtonIcon()
}

function updateButtonIcon() {
  const fab = chatButtonContainer?.querySelector('.lovebug-fab')
  
  if (fab) {
    if (chatOpen) {
      fab.classList.add('active')
    } else {
      fab.classList.remove('active')
    }
  }
}

function createFloatingUI(selection: SelectionInfo) {
  if (chatOpen) return
  
  removeFloatingUI()
  
  floatingUIContainer = document.createElement('div')
  floatingUIContainer.id = 'lovebug-floating-ui'
  floatingUIContainer.style.position = 'absolute'
  floatingUIContainer.style.left = `${selection.position.x}px`
  floatingUIContainer.style.top = `${selection.position.y}px`
  floatingUIContainer.style.zIndex = '999999'
  
  document.body.appendChild(floatingUIContainer)
  
  floatingUIRoot = ReactDOM.createRoot(floatingUIContainer)
  floatingUIRoot.render(
    <React.StrictMode>
      <FloatingUI selectedText={selection.text} onClose={removeFloatingUI} />
    </React.StrictMode>
  )
}

function removeFloatingUI() {
  if (floatingUIRoot) {
    floatingUIRoot.unmount()
    floatingUIRoot = null
  }
  if (floatingUIContainer) {
    floatingUIContainer.remove()
    floatingUIContainer = null
  }
}

function getSelectionInfo(): SelectionInfo | null {
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed) return null
  
  const selectedText = selection.toString().trim()
  if (!selectedText) return null
  
  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()
  
  return {
    text: selectedText,
    position: {
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 10
    }
  }
}

document.addEventListener('mouseup', () => {
  setTimeout(() => {
    const selection = getSelectionInfo()
    if (selection && !chatOpen) {
      createFloatingUI(selection)
    }
  }, 10)
})

document.addEventListener('mousedown', (e) => {
  const target = e.target as Node
  if (floatingUIContainer && !floatingUIContainer.contains(target)) {
    removeFloatingUI()
  }
})

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'SELECTION_CHANGED' && message.payload?.selectedText) {
    const selection = getSelectionInfo()
    if (selection) {
      createFloatingUI(selection)
    }
  }
})

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChatButton)
} else {
  createChatButton()
} 