import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { secureSSEClient } from '../../utils/sse-secure'
import * as security from '../../utils/security'

// fetch 모킹
globalThis.fetch = vi.fn()

describe('SecureSSEClient 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 기본 설정 초기화
    secureSSEClient.clearConfig()
    
    // security 함수들을 기본적으로 모킹
    vi.spyOn(security, 'decryptApiKey').mockReturnValue('decrypted-key')
    vi.spyOn(security, 'generateRequestSignature').mockReturnValue('signature')
    vi.spyOn(security, 'sanitizeInput').mockImplementation((input) => input)
    vi.spyOn(security, 'maskSensitiveData').mockImplementation((data) => data)
    vi.spyOn(security, 'secureLog').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('설정 관리', () => {
    it('설정을 저장하고 로그를 남겨야 함', () => {
      const mockSecureLog = vi.mocked(security.secureLog)
      
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      
      secureSSEClient.setConfig(config)
      
      expect(mockSecureLog).toHaveBeenCalledWith('info', 'SSE 클라이언트 설정 업데이트')
    })

    it('설정 없이 메시지 전송 시 에러를 발생시켜야 함', async () => {
      await expect(secureSSEClient.sendMessage('test')).rejects.toThrow(
        'SSE 클라이언트가 설정되지 않았습니다'
      )
    })
  })

  describe('Rate Limiting', () => {
    beforeEach(() => {
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)
    })

    it('요청 한도를 초과하면 에러를 발생시켜야 함', async () => {
      // fetch 모킹 - 성공 응답
      const mockFetch = vi.mocked(globalThis.fetch)
      mockFetch.mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: {
          getReader: () => ({
            read: vi.fn().mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"content": "test"}\n')
            }).mockResolvedValueOnce({
              done: true
            }),
            releaseLock: vi.fn()
          })
        }
      } as any)

      // 30번 요청 성공
      for (let i = 0; i < 30; i++) {
        await secureSSEClient.sendMessage(`test ${i}`)
      }

      // 31번째 요청은 실패해야 함
      await expect(secureSSEClient.sendMessage('test 31')).rejects.toThrow(
        '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.'
      )
    })
  })

  describe('입력값 검증', () => {
    beforeEach(() => {
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)
    })

    it('너무 긴 입력은 거부해야 함', async () => {
      const longText = 'a'.repeat(4001)
      
      await expect(secureSSEClient.sendMessage(longText)).rejects.toThrow(
        '입력 텍스트가 너무 깁니다 (최대 4000자)'
      )
    })

    it('입력값을 새니타이징해야 함', async () => {
      const mockSanitizeInput = vi.mocked(security.sanitizeInput)
      const maliciousInput = '<script>alert("XSS")</script>'
      
      // fetch 모킹
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: {
          getReader: () => ({
            read: vi.fn().mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn()
          })
        }
      } as any)
      
      await secureSSEClient.sendMessage(maliciousInput)
      
      expect(mockSanitizeInput).toHaveBeenCalledWith(maliciousInput)
    })
  })

  describe('보안 헤더 생성', () => {
    it('올바른 보안 헤더를 생성해야 함', async () => {
      const config = {
        encryptedApiKey: 'U2FsdGVkX1+test',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)

      const mockDecryptApiKey = vi.mocked(security.decryptApiKey)
      const mockGenerateSignature = vi.mocked(security.generateRequestSignature)
      
      let capturedHeaders: any
      vi.mocked(globalThis.fetch).mockImplementation(async (_url: any, options: any) => {
        capturedHeaders = options?.headers
        return {
          ok: true,
          headers: new Headers({ 'content-type': 'text/event-stream' }),
          body: {
            getReader: () => ({
              read: vi.fn().mockResolvedValueOnce({ done: true }),
              releaseLock: vi.fn()
            })
          }
        } as any
      })
      
      await secureSSEClient.sendMessage('test')
      
      expect(mockDecryptApiKey).toHaveBeenCalledWith('U2FsdGVkX1+test')
      expect(capturedHeaders['Authorization']).toBe('Bearer decrypted-key')
      expect(capturedHeaders['X-Signature']).toBe('signature')
      expect(capturedHeaders['X-Client-Version']).toBe('1.0.0')
      expect(capturedHeaders['Strict-Transport-Security']).toBe('max-age=31536000; includeSubDomains')
    })
  })

  describe('스트림 처리', () => {
    beforeEach(() => {
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)
    })

    it('SSE 스트림을 올바르게 처리해야 함', async () => {
      const chunks = [
        'data: {"content": "첫 번째"}\n',
        'data: {"content": " 두 번째"}\n',
        'data: [DONE]\n'
      ]
      
      let chunkIndex = 0
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: {
          getReader: () => ({
            read: vi.fn().mockImplementation(async () => {
              if (chunkIndex < chunks.length) {
                const chunk = chunks[chunkIndex++]
                return {
                  done: false,
                  value: new TextEncoder().encode(chunk)
                }
              }
              return { done: true }
            }),
            releaseLock: vi.fn()
          })
        }
      } as any)
      const result = await secureSSEClient.sendMessage('test')
      expect(result).toBe('첫 번째 두 번째')
    })
  })

  describe('에러 처리', () => {
    beforeEach(() => {
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)
    })

    it('HTTP 에러를 올바르게 처리해야 함', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      } as any)
      
      await expect(secureSSEClient.sendMessage('test')).rejects.toThrow(
        '요청이 실패했습니다: 403'
      )
    })

    it('잘못된 content-type을 거부해야 함', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' })
      } as any)
      
      await expect(secureSSEClient.sendMessage('test')).rejects.toThrow(
        '잘못된 응답 형식입니다'
      )
    })

    it('타임아웃을 처리해야 함', async () => {
      vi.mocked(globalThis.fetch).mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => {
            const error = new Error('Aborted')
            error.name = 'AbortError'
            reject(error)
          }, 100)
        })
      )
      
      await expect(secureSSEClient.sendMessage('test')).rejects.toThrow(
        '요청 시간이 초과되었습니다'
      )
    })
  })

  describe('연결 상태 확인', () => {
    it('연결 가능 여부를 확인해야 함', async () => {
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true
      } as any)
      const isConnected = await secureSSEClient.checkConnection()
      expect(isConnected).toBe(true)
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.nonghyup.local/health',
        expect.objectContaining({
          method: 'GET'
        })
      )
    })

    it('설정이 없으면 false를 반환해야 함', async () => {
      const isConnected = await secureSSEClient.checkConnection()
      expect(isConnected).toBe(false)
    })

    it('연결 실패 시 false를 반환해야 함', async () => {
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)
      vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'))
      const isConnected = await secureSSEClient.checkConnection()
      expect(isConnected).toBe(false)
    })
  })

  describe('감사 로깅', () => {
    beforeEach(() => {
      const config = {
        encryptedApiKey: 'encrypted-key',
        apiEndpoint: 'https://api.nonghyup.local',
        signatureSecret: 'secret',
        maxRetries: 3,
        timeout: 30000
      }
      secureSSEClient.setConfig(config)
    })

    it('요청 시작과 완료를 로깅해야 함', async () => {
      const mockSecureLog = vi.mocked(security.secureLog)
      
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/event-stream' }),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode('data: {"content": "결과"}\n')
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn()
          })
        }
      } as any)
      
      await secureSSEClient.sendMessage('test', {
        userId: 'NH12345',
        sessionId: 'session-123'
      })
      
      expect(mockSecureLog).toHaveBeenCalledWith(
        'info',
        'AI 요청 시작',
        expect.objectContaining({
          userId: 'NH12345',
          sessionId: 'session-123',
          promptLength: 4
        })
      )
      
      expect(mockSecureLog).toHaveBeenCalledWith(
        'info',
        'AI 요청 완료',
        expect.objectContaining({
          userId: 'NH12345',
          sessionId: 'session-123',
          responseLength: 2
        })
      )
    })

    it('에러를 로깅해야 함', async () => {
      const mockSecureLog = vi.mocked(security.secureLog)
      
      vi.mocked(globalThis.fetch).mockRejectedValue(new Error('API 오류'))
      
      await expect(
        secureSSEClient.sendMessage('test', {
          userId: 'NH12345',
          sessionId: 'session-123'
        })
      ).rejects.toThrow()
      
      expect(mockSecureLog).toHaveBeenCalledWith(
        'error',
        'AI 요청 에러',
        expect.objectContaining({
          error: 'API 오류',
          userId: 'NH12345',
          sessionId: 'session-123'
        })
      )
    })
  })
}) 