import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'

// Chrome API 모킹
const mockChrome = {
  runtime: {
    onInstalled: {
      addListener: vi.fn()
    },
    onMessage: {
      addListener: vi.fn()
    }
  },
  contextMenus: {
    create: vi.fn(),
    onClicked: {
      addListener: vi.fn()
    }
  },
  tabs: {
    sendMessage: vi.fn(),
    query: vi.fn()
  },
  storage: {
    sync: {
      get: vi.fn()
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
  action: {
    onClicked: {
      addListener: vi.fn()
    }
  }
}

// global chrome 설정
globalThis.chrome = mockChrome as any

describe('Background Script 테스트', () => {
  let installedListener: any
  let messageListener: any
  let contextMenuClickedListener: any
  let storageChangedListener: any
  let commandListener: any

  beforeAll(async () => {
    // chrome 전역 설정 후 background 로드
    globalThis.chrome = mockChrome as any
    await import('../background')
    
    installedListener = mockChrome.runtime.onInstalled.addListener.mock.calls[0]?.[0]
    messageListener = mockChrome.runtime.onMessage.addListener.mock.calls[0]?.[0]
    contextMenuClickedListener = mockChrome.contextMenus.onClicked.addListener.mock.calls[0]?.[0]
    storageChangedListener = mockChrome.storage.onChanged.addListener.mock.calls[0]?.[0]
    commandListener = mockChrome.commands.onCommand.addListener.mock.calls[0]?.[0]
  })

  beforeEach(() => {
    vi.clearAllMocks()
    
    // storage.sync.get 기본 동작 설정
    mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
      callback({})
    })
  })

  describe('설치 시 컨텍스트 메뉴 생성', () => {
    it('설치 시 컨텍스트 메뉴가 생성되어야 함', () => {
      // 설치 이벤트 트리거
      installedListener()
      
      expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(1)
      expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
        id: 'lovebug-menu',
        title: 'Lovebug Assistant',
        contexts: ['selection']
      })
    })

    it('설치 시 저장된 API 설정을 로드해야 함', () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiEndpoint: 'https://api.example.com',
          apiKey: 'test-key'
        })
      })
      
      installedListener()
      
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(
        ['apiEndpoint', 'apiKey'],
        expect.any(Function)
      )
    })
  })

  describe('컨텍스트 메뉴 클릭 처리', () => {
    it('메뉴 클릭 시 선택된 텍스트를 전송해야 함', () => {
      const info = {
        menuItemId: 'lovebug-menu',
        selectionText: '선택한 텍스트'
      }
      const tab = { id: 123 }
      
      contextMenuClickedListener(info, tab)
      
      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(123, {
        type: 'SELECTION_CHANGED',
        payload: {
          selectedText: '선택한 텍스트'
        }
      })
    })

    it('탭 ID가 없으면 메시지를 전송하지 않아야 함', () => {
      const info = {
        menuItemId: 'lovebug-menu',
        selectionText: '텍스트'
      }
      const tab = {}
      
      contextMenuClickedListener(info, tab)
      
      expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled()
    })

    it('다른 메뉴 ID는 무시해야 함', () => {
      const info = {
        menuItemId: 'other-menu',
        selectionText: '텍스트'
      }
      const tab = { id: 123 }
      
      contextMenuClickedListener(info, tab)
      
      expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled()
    })
  })

  describe('메시지 처리', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('GET_FEATURES 메시지를 처리해야 함', () => {
      const sendResponse = vi.fn()
      
      messageListener(
        { type: 'GET_FEATURES' },
        {},
        sendResponse
      )
      
      expect(sendResponse).toHaveBeenCalledWith({
        features: expect.any(Array)
      })
    })

    it('EXECUTE_FEATURE 메시지를 처리해야 함', () => {
      const sendResponse = vi.fn()
      
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ apiEndpoint: 'https://api.test.com', apiKey: 'test-key' })
      })
      
      const result = messageListener(
        { 
          type: 'EXECUTE_FEATURE',
          payload: {
            featureId: 'summarize',
            selectedText: '테스트 텍스트'
          }
        },
        {},
        sendResponse
      )
      
      expect(result).toBe(true) // 비동기 응답
      expect(mockChrome.storage.sync.get).toHaveBeenCalled()
    })

    it('API 설정이 없으면 mock 응답을 반환해야 함', async () => {
      const sendResponse = vi.fn()
      
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({}) // API 설정 없음
      })
      
      messageListener(
        { 
          type: 'EXECUTE_FEATURE',
          payload: {
            featureId: 'summarize',
            selectedText: '테스트'
          }
        },
        {},
        sendResponse
      )
      
      // 비동기 처리를 위해 대기
      await vi.runAllTimersAsync()
      
      expect(sendResponse).toHaveBeenCalled()
    })
  })

  describe('스토리지 변경 처리', () => {
    it('API 설정 변경 시 SSE 클라이언트를 업데이트해야 함', () => {
      mockChrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({
          apiEndpoint: 'https://new-api.test.com',
          apiKey: 'new-key'
        })
      })
      
      storageChangedListener({
        apiEndpoint: { newValue: 'https://new-api.test.com' }
      })
      
      expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(
        ['apiEndpoint', 'apiKey'],
        expect.any(Function)
      )
    })
  })

  describe('커맨드 처리', () => {
    it('커맨드 실행 시 활성 탭에 메시지를 전송해야 함', () => {
      mockChrome.tabs.query.mockImplementation((query, callback) => {
        callback([{ id: 999 }])
      })
      
      commandListener('toggle-chat')
      
      expect(mockChrome.tabs.query).toHaveBeenCalledWith(
        { active: true, currentWindow: true },
        expect.any(Function)
      )
      
      expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(999, {
        type: 'COMMAND',
        payload: { command: 'toggle-chat' }
      })
    })

    it('활성 탭이 없으면 메시지를 전송하지 않아야 함', () => {
      mockChrome.tabs.query.mockImplementation((query, callback) => {
        callback([])
      })
      
      commandListener('toggle-chat')
      
      expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled()
    })
  })
}) 