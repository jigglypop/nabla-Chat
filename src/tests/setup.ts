import '@testing-library/jest-dom'
import { vi, beforeAll } from 'vitest'

// Chrome API 모킹
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn()
    },
    onInstalled: {
      addListener: vi.fn()
    },
    sendMessage: vi.fn(),
    getURL: vi.fn(url => `chrome-extension://test-id/${url}`)
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn()
    }
  },
  storage: {
    sync: {
      get: vi.fn((keys, callback) => {
        callback({})
      }),
      set: vi.fn((items, callback) => {
        if (callback) callback()
      })
    },
    onChanged: {
      addListener: vi.fn()
    }
  },
  commands: {
    onCommand: {
      addListener: vi.fn()
    }
  },
  tabs: {
    query: vi.fn(),
    sendMessage: vi.fn()
  }
} as any

beforeAll(() => {
  // Chrome API를 전역 객체에 추가
  globalThis.chrome = mockChrome as any
  
  // crypto.randomUUID 모킹
  if (!globalThis.crypto) {
    // @ts-ignore
    globalThis.crypto = {}
  }
  vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('test-uuid')
  
  // scrollIntoView 모킹
  Element.prototype.scrollIntoView = vi.fn()
  
  // getBoundingClientRect 모킹
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    x: 0,
    y: 0,
    width: 420,
    height: 600,
    top: 0,
    right: 420,
    bottom: 600,
    left: 0,
    toJSON: () => ({})
  })
  
  // window.getComputedStyle 모킹
  const originalGetComputedStyle = window.getComputedStyle
  window.getComputedStyle = vi.fn().mockImplementation((element) => {
    // 실제 요소가 전달되면 기본 스타일 반환
    if (element) {
      return {
        getPropertyValue: vi.fn((property: string) => {
          const styles: Record<string, string> = {
            'visibility': 'visible',
            'display': 'block',
            'width': '420px',
            'height': '600px',
            'top': '0px',
            'left': '0px',
            'transform': 'none'
          }
          return styles[property] || '0px'
        }),
        visibility: 'visible',
        display: 'block'
      }
    }
    // 요소가 없으면 원래 함수 호출
    return originalGetComputedStyle.call(window, element)
  }) as any
  
  // ResizeObserver 모킹
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
  
  // IntersectionObserver 모킹
  globalThis.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }))
})

// crypto.randomUUID 모킹
if (typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
  // randomUUID만 스파이로 교체
  vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(() => 'test-uuid-' + Math.random())
} else {
  // crypto가 없거나 randomUUID가 없는 환경을 위해 polyfill 제공
  // @ts-ignore
  globalThis.crypto = {
    // ... existing code ...
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random())
  }
}

// CSS.escape polyfill for jsdom
if (!window.CSS || !window.CSS.escape) {
  // @ts-ignore
  window.CSS = {
    ...(window.CSS || {}),
    escape: (sel: string) => sel.replace(/[^\w-]/g, '\\$&')
  }
} 