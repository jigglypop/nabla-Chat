import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  encryptApiKey,
  decryptApiKey,
  isAllowedOrigin,
  sanitizeInput,
  generateRequestSignature,
  validateSessionToken,
  maskSensitiveData,
  secureLog
} from '../../utils/security'

describe('보안 유틸리티 테스트', () => {
  describe('API 키 암호화/복호화', () => {
    it('API 키를 암호화하고 복호화할 수 있어야 함', () => {
      const apiKey = 'sk-test-12345'
      const encrypted = encryptApiKey(apiKey)
      expect(encrypted).not.toBe(apiKey)
      expect(encrypted).toContain('U2FsdGVkX1') 
      const decrypted = decryptApiKey(encrypted)
      expect(decrypted).toBe(apiKey)
    })

    it('잘못된 암호화 키로 복호화 시 빈 문자열이 반환되어야 함', () => {
      const encrypted = 'U2FsdGVkX1+invalid'
      const decrypted = decryptApiKey(encrypted)
      expect(decrypted).toBe('')
    })
  })

  describe('Origin 검증', () => {
    it('허용된 origin을 올바르게 검증해야 함', () => {
      expect(isAllowedOrigin('https://company-internal.com')).toBe(true)
      expect(isAllowedOrigin('https://subdomain.company-internal.com')).toBe(true)
      expect(isAllowedOrigin('https://app.subdomain.company-internal.com')).toBe(true)
    })

    it('허용되지 않은 origin을 거부해야 함', () => {
      expect(isAllowedOrigin('https://evil.com')).toBe(false)
      expect(isAllowedOrigin('http://company-internal.com')).toBe(false) // HTTP
      expect(isAllowedOrigin('https://fake-company-internal.com')).toBe(false)
    })
  })

  describe('입력값 새니타이징', () => {
    it('스크립트 태그를 이스케이프해야 함', () => {
      const input = '<script>alert("XSS")</script>Hello'
      const sanitized = sanitizeInput(input)
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;Hello')
    })

    it('위험한 문자를 이스케이프해야 함', () => {
      const input = '& < > " \' /'
      const sanitized = sanitizeInput(input)
      expect(sanitized).toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;')
    })

    it('일반 텍스트는 변경하지 않아야 함', () => {
      const input = '안녕하세요 Hello 123'
      const sanitized = sanitizeInput(input)
      expect(sanitized).toBe(input)
    })
  })

  describe('요청 서명 생성', () => {
    it('동일한 데이터에 대해 같은 서명을 생성해야 함', () => {
      const data = { userId: 'user123', action: 'read' }
      const secret = 'secret-key'
      const signature1 = generateRequestSignature(data, secret)
      const signature2 = generateRequestSignature(data, secret)
      expect(signature1).toBe(signature2)
      expect(signature1.length).toBe(64) // SHA256 hex string length
    })

    it('다른 데이터에 대해 다른 서명을 생성해야 함', () => {
      const data1 = { userId: 'user123' }
      const data2 = { userId: 'user456' }
      const secret = 'secret-key'
      
      const signature1 = generateRequestSignature(data1, secret)
      const signature2 = generateRequestSignature(data2, secret)
      
      expect(signature1).not.toBe(signature2)
    })
  })

  describe('세션 토큰 검증', () => {
    it('유효한 JWT 토큰을 검증해야 함', () => {
      // 미래 만료 시간을 가진 토큰
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.signature'
      
      expect(validateSessionToken(validToken)).toBe(true)
    })

    it('만료된 토큰을 거부해야 함', () => {
      // 과거 만료 시간을 가진 토큰
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.signature'
      
      expect(validateSessionToken(expiredToken)).toBe(false)
    })

    it('잘못된 형식의 토큰을 거부해야 함', () => {
      expect(validateSessionToken('invalid-token')).toBe(false)
      expect(validateSessionToken('a.b')).toBe(false) // 3개 파트가 아님
    })

    it('지원하지 않는 알고리즘을 거부해야 함', () => {
      // none 알고리즘 토큰
      const noneToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJleHAiOjk5OTk5OTk5OTl9.signature'
      
      expect(validateSessionToken(noneToken)).toBe(false)
    })
  })

  describe('민감한 데이터 마스킹', () => {
    it('지정된 필드를 마스킹해야 함', () => {
      const data = {
        apiKey: 'sk-1234567890abcdef',
        password: 'mySecretPassword',
        email: 'user@example.com'
      }
      
      const masked = maskSensitiveData(data, ['apiKey', 'password'])
      
      expect(masked.apiKey).toBe('sk***************ef')
      expect(masked.password).toBe('my************rd')
      expect(masked.email).toBe('user@example.com')
    })

    it('짧은 값도 올바르게 마스킹해야 함', () => {
      const data = {
        pin: '1234',
        code: 'ABC'
      }
      
      const masked = maskSensitiveData(data, ['pin', 'code'])
      
      expect(masked.pin).toBe('****')
      expect(masked.code).toBe('***')
    })

    it('원본 데이터를 변경하지 않아야 함', () => {
      const data = { apiKey: 'secret' }
      const masked = maskSensitiveData(data, ['apiKey'])
      
      expect(data.apiKey).toBe('secret')
      expect(masked.apiKey).toBe('******')
    })
  })

  describe('보안 로깅', () => {
    beforeEach(() => {
      vi.spyOn(console, 'info').mockImplementation(() => {})
      vi.spyOn(console, 'warn').mockImplementation(() => {})
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('로그 레벨에 따라 올바른 콘솔 메서드를 호출해야 함', () => {
      secureLog('info', 'Info message')
      expect(console.info).toHaveBeenCalled()
      
      secureLog('warn', 'Warning message')
      expect(console.warn).toHaveBeenCalled()
      
      secureLog('error', 'Error message')
      expect(console.error).toHaveBeenCalled()
    })

    it('민감한 데이터를 자동으로 마스킹해야 함', () => {
      const sensitiveData = {
        apiKey: 'secret-key',
        userId: 'user123',
        action: 'login'
      }
      
      secureLog('info', 'User action', sensitiveData)
      
      const logCall = (console.info as any).mock.calls[0][0]
      expect(logCall.data.apiKey).toContain('*')
      expect(logCall.data.userId).toBe('user123')
      expect(logCall.data.action).toBe('login')
    })

    it('민감한 정보를 마스킹하여 로그해야 함', () => {
      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
      
      secureLog('info', '테스트 메시지', {
        apiKey: 'sk-secret',
        userId: 'user123'
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'info',
          message: '테스트 메시지',
          data: expect.objectContaining({
            apiKey: expect.stringContaining('*'),
            userId: 'user123'
          })
        })
      )
      
      consoleSpy.mockRestore()
    })

    it('메시지도 새니타이징해야 함', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      secureLog('warn', '<script>alert("XSS")</script>')
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.not.stringContaining('<script>')
        })
      )
      
      consoleSpy.mockRestore()
    })
  })
}) 