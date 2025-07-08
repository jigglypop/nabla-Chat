
import { decryptApiKey, generateRequestSignature, secureLog, sanitizeInput } from './security'

interface SSEOptions {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  userId?: string
  sessionId?: string
}

interface SecurityConfig {
  encryptedApiKey: string
  apiEndpoint: string
  signatureSecret: string
  maxRetries: number
  timeout: number
}

class SecureSSEClient {
  private config: SecurityConfig | null = null
  private requestCount = 0
  private lastRequestTime = 0
  private readonly rateLimitWindow = 60000 // 1분
  private readonly maxRequestsPerWindow = 30

  /**
   * 보안 설정 초기화
   * @param config - 보안 설정
   */
  setConfig(config: SecurityConfig) {
    this.config = config
    secureLog('info', 'SSE 클라이언트 설정 업데이트')
  }

  /**
   * Rate limiting 검사
   * @returns 요청 가능 여부
   */
  private checkRateLimit(): boolean {
    const now = Date.now()
    
    if (now - this.lastRequestTime > this.rateLimitWindow) {
      this.requestCount = 0
      this.lastRequestTime = now
    }
    
    if (this.requestCount >= this.maxRequestsPerWindow) {
      secureLog('warn', 'Rate limit 초과', { 
        requestCount: this.requestCount,
        window: this.rateLimitWindow 
      })
      return false
    }
    
    this.requestCount++
    return true
  }

  /**
   * 보안 헤더 생성
   * @param data - 요청 데이터
   * @returns 보안 헤더
   */
  private createSecureHeaders(data: any): HeadersInit {
    if (!this.config) throw new Error('Configuration not set')
    
    const timestamp = Date.now()
    const requestId = crypto.randomUUID()
    const signature = generateRequestSignature(
      { ...data, timestamp, requestId },
      this.config.signatureSecret
    )
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${decryptApiKey(this.config.encryptedApiKey)}`,
      'X-Request-ID': requestId,
      'X-Timestamp': timestamp.toString(),
      'X-Signature': signature,
      'X-Client-Version': '1.0.0',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  }

  /**
   * 메시지 전송 (보안 강화)
   * @param prompt - 사용자 프롬프트
   * @param options - 추가 옵션
   * @returns AI 응답
   */
  async sendMessage(prompt: string, options: SSEOptions = {}): Promise<string> {
    if (!this.config) {
      throw new Error('SSE 클라이언트가 설정되지 않았습니다')
    }

    // Rate limiting 체크
    if (!this.checkRateLimit()) {
      throw new Error('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.')
    }

    // 입력값 검증
    const sanitizedPrompt = sanitizeInput(prompt)
    if (sanitizedPrompt.length > 4000) {
      throw new Error('입력 텍스트가 너무 깁니다 (최대 4000자)')
    }

    const requestData = {
      prompt: sanitizedPrompt,
      systemPrompt: options.systemPrompt ? sanitizeInput(options.systemPrompt) : undefined,
      temperature: Math.max(0, Math.min(1, options.temperature || 0.7)),
      maxTokens: Math.max(1, Math.min(2000, options.maxTokens || 1000)),
      stream: true,
      userId: options.userId,
      sessionId: options.sessionId
    }

    // 감사 로깅
    secureLog('info', 'AI 요청 시작', {
      userId: options.userId,
      sessionId: options.sessionId,
      promptLength: sanitizedPrompt.length
    })

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000)

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: this.createSecureHeaders(requestData),
        body: JSON.stringify(requestData),
        signal: controller.signal,
        credentials: 'same-origin', // CORS 보안
        mode: 'cors'
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        secureLog('error', 'API 요청 실패', {
          status: response.status,
          statusText: response.statusText
        })
        throw new Error(`요청이 실패했습니다: ${response.status}`)
      }

      // 응답 헤더 검증
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('text/event-stream')) {
        throw new Error('잘못된 응답 형식입니다')
      }

      const result = await this.processSecureStream(response)
      
      // 성공 로깅
      secureLog('info', 'AI 요청 완료', {
        userId: options.userId,
        sessionId: options.sessionId,
        responseLength: result.length
      })

      return result
    } catch (error) {
      // 에러 로깅
      secureLog('error', 'AI 요청 에러', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: options.userId,
        sessionId: options.sessionId
      })
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다')
      }
      
      throw error
    }
  }

  /**
   * 스트림 처리 (보안 강화)
   * @param response - 응답 객체
   * @returns 처리된 텍스트
   */
  private async processSecureStream(response: Response): Promise<string> {
    const reader = response.body?.getReader()
    if (!reader) throw new Error('응답을 읽을 수 없습니다')

    const decoder = new TextDecoder()
    let result = ''
    const maxLength = 10000 // 최대 응답 길이 제한

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              
              // 컨텐츠 검증
              if (parsed.content && typeof parsed.content === 'string') {
                result += sanitizeInput(parsed.content)
                
                // 길이 제한 체크
                if (result.length > maxLength) {
                  throw new Error('응답이 너무 깁니다')
                }
              }
            } catch (e) {
              secureLog('warn', 'SSE 데이터 파싱 실패', { error: e })
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return result
  }

  /**
   * 연결 상태 확인
   * @returns 연결 가능 여부
   */
  async checkConnection(): Promise<boolean> {
    if (!this.config) return false

    try {
      const response = await fetch(`${this.config.apiEndpoint}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${decryptApiKey(this.config.encryptedApiKey)}`
        },
        signal: AbortSignal.timeout(5000)
      })

      return response.ok
    } catch {
      return false
    }
  }

  /**
   * 설정 초기화
   */
  clearConfig() {
    this.config = null
    this.requestCount = 0
    this.lastRequestTime = 0
    secureLog('info', 'SSE 클라이언트 설정 초기화')
  }
}

export const secureSSEClient = new SecureSSEClient() 