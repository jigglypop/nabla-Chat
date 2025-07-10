import React from 'react'
import ReactDOM from 'react-dom/client'
import type { Message, SelectionInfo } from './types'
import FloatingUI from './containers/FloatingUI/FloatingUI'
import ChatApp from './containers/ChatApp/ChatApp'
import styles from './content.module.css'

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
  const button = document.createElement('button')
  button.className = styles.chatButton
  const overlay = document.createElement('span')
  overlay.className = styles.chatButtonOverlay
  const chatIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  chatIcon.setAttribute('class', `${styles.chatIcon} chat-icon`)
  chatIcon.setAttribute('width', '24')
  chatIcon.setAttribute('height', '24')
  chatIcon.setAttribute('viewBox', '0 0 24 24')
  chatIcon.innerHTML = '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>'
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
  if (chatOpen) {
    closeChatInterface()
  } else {
    openChatInterface()
  }
}

function openChatInterface(selectedText?: string) {
  removeFloatingUI()
  if (chatContainer) return
  chatContainer = document.createElement('div')
  chatContainer.id = 'lovebug-chat-app'
  document.body.appendChild(chatContainer)
  chatRoot = ReactDOM.createRoot(chatContainer)
  chatRoot.render(
    <React.StrictMode>
      <ChatApp 
        onClose={closeChatInterface} 
      />
    </React.StrictMode>
  )
  chatOpen = true
  updateButtonIcon()
  
  if (selectedText) {
    setTimeout(() => {
      window.postMessage({
        type: 'SEND_TO_CHAT',
        text: selectedText
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
  chatOpen = false
  updateButtonIcon()
}

function updateButtonIcon() {
  const button = chatButtonContainer?.querySelector('button')
  
  if (button) {
    if (chatOpen) {
      button.classList.add(styles.chatOpen)
      chatButtonContainer!.style.display = 'none'
    } else {
      button.classList.remove(styles.chatOpen)
      chatButtonContainer!.style.display = 'block'
    }
  }
}

function createFloatingUI(selection: SelectionInfo) {
  if (chatOpen) return
  
  removeFloatingUI()
  
  floatingUIContainer = document.createElement('div')
  floatingUIContainer.id = 'lovebug-floating-ui'
  floatingUIContainer.className = styles.floatingUI
  
  const range = window.getSelection()?.getRangeAt(0)
  if (range) {
    const rect = range.getBoundingClientRect()
    floatingUIContainer.style.left = `${rect.right + window.scrollX + 5}px`
    floatingUIContainer.style.top = `${rect.top + window.scrollY + (rect.height / 2) - 18}px`
  } else {
    floatingUIContainer.style.left = `${selection.position.x}px`
    floatingUIContainer.style.top = `${selection.position.y}px`
  }
  
  document.body.appendChild(floatingUIContainer)
  
  floatingUIRoot = ReactDOM.createRoot(floatingUIContainer)
  floatingUIRoot.render(
    <React.StrictMode>
      <FloatingUI
        selectedText={selection.text}
        onClose={removeFloatingUI}
        onExecutePlugin={handlePluginExecution}
      />
    </React.StrictMode>
  )
  
  // 자동 닫기 로직 완전 제거 - 오직 닫기 버튼으로만 닫힘
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
    // 플로팅 UI가 이미 열려있으면 새로 열지 않음
    if (selection && !chatOpen && !floatingUIContainer) {
      createFloatingUI(selection)
    }
  }, 10)
})

function resizeChatWindow(direction: 'larger' | 'smaller') {
  if (!chatOpen || !chatRoot) return
  
  window.postMessage({
    type: 'RESIZE_CHAT',
    direction: direction
  }, '*')
}

chrome.runtime.onMessage.addListener((message: Message) => {
  if (message.type === 'SELECTION_CHANGED' && message.payload?.selectedText) {
    const selection = getSelectionInfo()
    if (selection) {
      createFloatingUI(selection)
    }
  } else if (message.type === 'COMMAND' && message.payload?.command) {
    const command = message.payload.command
    
    switch (command) {
      case 'send-to-ai':
        const selection = window.getSelection()?.toString().trim()
        if (selection) {
          if (floatingUIContainer) {
            window.postMessage({ type: 'TOGGLE_FLOATING_UI' }, '*')
          } else {
            const selectionInfo = getSelectionInfo()
            if (selectionInfo) {
              createFloatingUI(selectionInfo)
              setTimeout(() => {
                window.postMessage({ type: 'TOGGLE_FLOATING_UI' }, '*')
              }, 100)
            }
          }
        }
        break
        
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChatButton)
} else {
  createChatButton()
} 

const handlePluginExecution = (pluginId: string, text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'EXECUTE_PLUGIN', pluginId, text }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return reject(new Error(chrome.runtime.lastError.message));
      }

      if (response?.success) {
        window.postMessage({ type: 'SEND_TO_CHAT', text: response.data }, '*');
        resolve();
      } else {
        const errorMessage = response?.error || '플러그인 실행 중 오류가 발생했습니다.';
        window.postMessage({ type: 'SEND_TO_CHAT', text: `오류: ${errorMessage}` }, '*');
        reject(new Error(errorMessage));
      }
    });
  });
};