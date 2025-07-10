import React from 'react'
import ReactDOM from 'react-dom/client'
import type { Message, SelectionInfo } from './types'
import FloatingUI from './containers/FloatingUI/FloatingUI'
import ChatApp from './containers/ChatApp/ChatApp'
import styles from './content.module.css'
import { Provider } from 'jotai'
import { store } from './atoms/store'
import { floatingPositionAtom, chatOpenAtom, isDraggingFloatingUIAtom } from './atoms/chatAtoms'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

let floatingUIRoot: ReactDOM.Root | null = null
let floatingUIContainer: HTMLElement | null = null
let chatRoot: ReactDOM.Root | null = null
let chatContainer: HTMLElement | null = null
let chatButtonContainer: HTMLElement | null = null
// 상태는 jotai store atom으로 관리
let currentActiveElement: HTMLInputElement | HTMLTextAreaElement | null = null;
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
  removeFloatingUI()
  
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

function createFloatingUI(selection: SelectionInfo) {
  if (store.get(chatOpenAtom)) return

  removeFloatingUI()

  const activeEl = document.activeElement
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    currentActiveElement = activeEl as HTMLInputElement | HTMLTextAreaElement
  } else {
    currentActiveElement = null
  }
  floatingUIContainer = document.createElement('div')
  floatingUIContainer.id = 'nabla-floating-ui'
  floatingUIContainer.className = styles.floatingUI
  floatingUIContainer.style.position = 'fixed'
  // 드래그 이벤트 감지
  floatingUIContainer.addEventListener('mousedown', (e) => {
    const target = e.target as HTMLElement
    // 헤더나 헤더의 자식 요소를 클릭했는지 확인
    let currentElement: HTMLElement | null = target
    while (currentElement && currentElement !== floatingUIContainer) {
      if (currentElement.getAttribute('data-draggable') === 'true') {
        store.set(isDraggingFloatingUIAtom, true)
        break
      }
      currentElement = currentElement.parentElement
    }
  })
  
  // 초기 위치 설정 (마우스 커서 기준)
  let left = selection.position.x - window.scrollX
  let top = selection.position.y - window.scrollY
  // 뷰포트 경계 체크
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const estimatedWidth = 300 // FloatingUI의 예상 너비
  const estimatedHeight = 200 // FloatingUI의 예상 높이
  // 화면 오른쪽을 벗어나는 경우
  if (left + estimatedWidth > viewportWidth - 10) {
    left = viewportWidth - estimatedWidth - 10
  }
  // 화면 아래를 벗어나는 경우
  if (top + estimatedHeight > viewportHeight - 10) {
    top = viewportHeight - estimatedHeight - 10
  }
  // 화면 왼쪽을 벗어나는 경우
  if (left < 10) {
    left = 10
  }
  // 화면 위를 벗어나는 경우
  if (top < 10) {
    top = 10
  }
  // Jotai atom에 위치 저장
  store.set(floatingPositionAtom, { x: left, y: top })
  document.body.appendChild(floatingUIContainer)
  floatingUIRoot = ReactDOM.createRoot(floatingUIContainer)
  floatingUIRoot.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <FloatingUI
            selectedText={selection.text}
            onClose={removeFloatingUI}
            onExecutePlugin={handlePluginExecution}
            activeElement={currentActiveElement}
          />
        </Provider>
      </QueryClientProvider>
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
  currentActiveElement = null
}

document.addEventListener('mouseup', (e) => {
  // 드래그가 끝났음을 표시
  if (store.get(isDraggingFloatingUIAtom)) {
    store.set(isDraggingFloatingUIAtom, false)
    return // 드래그 중이었다면 아무것도 하지 않음
  }
  
  // Do nothing if the click is inside the floating UI
  if (floatingUIContainer && floatingUIContainer.contains(e.target as Node)) {
    return
  }

  setTimeout(() => {
    let selectionInfo: SelectionInfo | null = null
    const activeEl = document.activeElement

    // Logic for input fields
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const inputEl = activeEl as HTMLInputElement | HTMLTextAreaElement
      const start = inputEl.selectionStart
      const end = inputEl.selectionEnd

      if (start !== null && end !== null && start !== end) {
        const selectedText = inputEl.value.substring(start, end).trim()
        if (selectedText) {
          selectionInfo = {
            text: selectedText,
            position: {
              x: e.pageX + 5, // Position relative to cursor
              y: e.pageY + 5,
            },
          }
        }
      }
    } else { // Logic for general text
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        const selectedText = selection.toString().trim()
        if (selectedText) {
          selectionInfo = {
            text: selectedText,
            position: {
              x: e.pageX + 5, // Position relative to cursor
              y: e.pageY + 5,
            },
          }
        }
      }
    }

    if (selectionInfo && !store.get(chatOpenAtom)) {
      createFloatingUI(selectionInfo)
    } else if (!selectionInfo) {
      const targetIsFloatingUI = floatingUIContainer && floatingUIContainer.contains(document.activeElement as Node);
      if (!targetIsFloatingUI) {
         removeFloatingUI();
      }
    }
  }, 10)
})

function resizeChatWindow(direction: 'larger' | 'smaller') {
  if (!store.get(chatOpenAtom) || !chatRoot) return

  window.postMessage({
    type: 'RESIZE_CHAT',
    direction: direction,
  }, '*')
}
if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type === 'SELECTION_CHANGED' && message.payload?.selectedText) {
      // This part seems complex, let's simplify or rely on mouseup
    } else if (message.type === 'COMMAND' && message.payload?.command) {
      const command = message.payload.command;
      switch (command) {
        case 'send-to-ai':
          break;
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

const handlePluginExecution = (pluginId: string, text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'EXECUTE_PLUGIN', pluginId, text }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message)
        return reject(new Error(chrome.runtime.lastError.message))
      }

      if (response?.success) {
        // We let FloatingUI handle the result directly.
        // This message passing might not be needed anymore for this flow.
        resolve()
      } else {
        const errorMessage = response?.error || '플러그인 실행 중 오류가 발생했습니다.'
        console.error(errorMessage)
        reject(new Error(errorMessage))
      }
    })
  })
}