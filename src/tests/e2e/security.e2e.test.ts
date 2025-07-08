import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import type { Browser, Page, BrowserContext } from 'playwright'
import { chromium } from 'playwright'

// E2E 테스트는 실제 브라우저 환경이 필요하므로 일단 스킵
describe.skip('보안 E2E 테스트', () => {
  let browser: Browser
  let context: BrowserContext
  let page: Page
  
  const extensionPath = './dist'
  
  beforeAll(async () => {
    browser = await chromium.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    })
  })
  
  afterAll(async () => {
    await browser.close()
  })
  
  beforeEach(async () => {
    context = await browser.newContext()
    page = await context.newPage()
  })
  
  describe('도메인 제한 테스트', () => {
    it('허용된 도메인에서만 content script가 실행되어야 함', async () => {
      // 허용된 도메인
      await page.goto('https://company-internal.com')
      const floatingButton = await page.locator('#lovebug-chat-button')
      await expect(floatingButton).toBeVisible()
      
      // 허용되지 않은 도메인
      await page.goto('https://example.com')
      const externalButton = await page.locator('#lovebug-chat-button')
      await expect(externalButton).not.toBeVisible()
    })
    
    it('외부 도메인에서 API 호출을 차단해야 함', async () => {
      await page.goto('https://evil.com')
      
      // 악의적인 postMessage 시도
      const response = await page.evaluate(() => {
        return new Promise(resolve => {
          window.postMessage({
            type: 'EXECUTE_FEATURE',
            payload: {
              featureId: 'summarize',
              selectedText: 'test'
            }
          }, '*')
          
          setTimeout(() => resolve('no response'), 1000)
        })
      })
      
      expect(response).toBe('no response')
    })
  })
  
  describe('XSS 방지 테스트', () => {
    it('사용자 입력에서 스크립트 태그를 제거해야 함', async () => {
      await page.goto('https://company-internal.com')
      
      // 텍스트 선택 시뮬레이션
      await page.evaluate(() => {
        const maliciousText = '<script>alert("XSS")</script>Hello'
        const range = document.createRange()
        const textNode = document.createTextNode(maliciousText)
        document.body.appendChild(textNode)
        range.selectNode(textNode)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      })
      
      // mouseup 이벤트 트리거
      await page.mouse.click(100, 100)
      
      // 플로팅 UI 확인
      const floatingUI = await page.locator('#lovebug-floating-ui')
      await expect(floatingUI).toBeVisible()
      
      // 악성 스크립트가 실행되지 않았는지 확인
      const alerts = await page.evaluate(() => {
        // @ts-ignore
        return window.alertTriggered || false
      })
      expect(alerts).toBe(false)
    })
    
    it('API 응답의 HTML을 안전하게 렌더링해야 함', async () => {
      await page.goto('https://company-internal.com')
      
      // Mock API 응답에 악성 코드 포함
      await page.evaluate(() => {
        // @ts-ignore
        window.chrome.runtime.sendMessage = (message: any, callback: any) => {
          if (message.type === 'EXECUTE_FEATURE') {
            callback({
              result: '<img src="x" onerror="alert(\'XSS\')">Malicious content'
            })
          }
        }
      })
      
      // 기능 실행
      // ... 플로팅 UI 열고 기능 실행
      
      // 악성 코드가 실행되지 않았는지 확인
      const imgTags = await page.locator('img[src="x"]').count()
      expect(imgTags).toBe(0)
    })
  })
  
  describe('API 키 보호 테스트', () => {
    it('API 키가 평문으로 저장되지 않아야 함', async () => {
      await page.goto('chrome-extension://extension-id/index.html')
      
      // API 키 설정
      const testApiKey = 'sk-test-1234567890'
      await page.evaluate((key: string) => {
        return new Promise(resolve => {
          // @ts-ignore
          chrome.storage.sync.set({ apiKey: key }, resolve)
        })
      }, testApiKey)
      
      // Storage 확인
      const storageData = await page.evaluate(() => {
        return new Promise(resolve => {
          // @ts-ignore
          chrome.storage.sync.get(['apiKey'], resolve)
        })
      })
      
      // API 키가 암호화되어 있는지 확인
      // @ts-ignore
      expect(storageData.apiKey).not.toBe(testApiKey)
      // @ts-ignore
      expect(storageData.apiKey).toContain('U2FsdGVkX1') // AES 암호화 prefix
    })
  })
  
  describe('Rate Limiting 테스트', () => {
    it('과도한 요청을 차단해야 함', async () => {
      await page.goto('https://company-internal.com')
      
      // 30개 이상의 요청 시도
      const results = await page.evaluate(async () => {
        const requests = []
        for (let i = 0; i < 35; i++) {
          requests.push(
            new Promise(resolve => {
              // @ts-ignore
              chrome.runtime.sendMessage({
                type: 'EXECUTE_FEATURE',
                payload: {
                  featureId: 'summarize',
                  selectedText: `Test ${i}`
                }
              }, (response: any) => {
                resolve(response)
              })
            })
          )
        }
        
        return Promise.all(requests)
      })
      
      // 마지막 5개 요청은 rate limit 에러여야 함
      const lastRequests = results.slice(-5)
      lastRequests.forEach((result: any) => {
        expect(result.result).toContain('요청 한도를 초과')
      })
    })
  })
  
  describe('CSP 정책 테스트', () => {
    it('인라인 스크립트 실행을 차단해야 함', async () => {
      await page.goto('chrome-extension://extension-id/index.html')
      
      // CSP 위반 시도
      const cspViolated = await page.evaluate(() => {
        try {
          // @ts-ignore
          eval('console.log("CSP violated")')
          return false
        } catch (e) {
          return true
        }
      })
      
      expect(cspViolated).toBe(true)
    })
    
    it('외부 리소스 로딩을 제한해야 함', async () => {
      await page.goto('chrome-extension://extension-id/index.html')
      
      // 외부 스크립트 로딩 시도
      const loaded = await page.evaluate(() => {
        return new Promise(resolve => {
          const script = document.createElement('script')
          script.src = 'https://evil.com/malicious.js'
          script.onload = () => resolve(true)
          script.onerror = () => resolve(false)
          document.head.appendChild(script)
        })
      })
      
      expect(loaded).toBe(false)
    })
  })
  
  describe('세션 관리 테스트', () => {
    it('만료된 세션을 거부해야 함', async () => {
      await page.goto('https://company-internal.com')
      
      // 만료된 토큰 설정
      await page.evaluate(() => {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.signature'
        // @ts-ignore
        chrome.storage.sync.set({ sessionToken: expiredToken })
      })
      
      // API 호출 시도
      const response = await page.evaluate(() => {
        return new Promise(resolve => {
          // @ts-ignore
          chrome.runtime.sendMessage({
            type: 'EXECUTE_FEATURE',
            payload: {
              featureId: 'summarize',
              selectedText: 'Test'
            }
          }, resolve)
        })
      })
      
      // @ts-ignore
      expect(response.result).toContain('세션이 만료')
    })
  })
  
  describe('로깅 및 감사 테스트', () => {
    it('민감한 정보가 로그에 포함되지 않아야 함', async () => {
      const consoleLogs: string[] = []
      
      page.on('console', (msg: any) => {
        consoleLogs.push(msg.text())
      })
      
      await page.goto('https://company-internal.com')
      
      // API 키와 함께 요청
      await page.evaluate(() => {
        // @ts-ignore
        chrome.runtime.sendMessage({
          type: 'EXECUTE_FEATURE',
          payload: {
            featureId: 'summarize',
            selectedText: 'Test',
            apiKey: 'sk-secret-key-12345'
          }
        })
      })
      
      // 로그에 API 키가 포함되지 않았는지 확인
      const hasApiKey = consoleLogs.some(log => 
        log.includes('sk-secret-key-12345')
      )
      expect(hasApiKey).toBe(false)
      
      // 마스킹된 형태로 로그되었는지 확인
      const hasMaskedKey = consoleLogs.some(log => 
        log.includes('sk***')
      )
      expect(hasMaskedKey).toBe(true)
    })
  })
}) 