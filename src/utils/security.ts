import crypto from 'crypto-js'

const ENCRYPTION_KEY = import.meta.env?.VITE_ENCRYPTION_KEY || 'default-key-change-in-production'

/**
 * API 키 암호화
 * @param apiKey - 평문 API 키
 * @returns 암호화된 API 키
 */
export function encryptApiKey(apiKey: string): string {
  return crypto.AES.encrypt(apiKey, ENCRYPTION_KEY).toString()
}

/**
 * API 키 복호화
 * @param encryptedKey - 암호화된 API 키
 * @returns 복호화된 API 키
 */
export function decryptApiKey(encryptedKey: string): string {
  const bytes = crypto.AES.decrypt(encryptedKey, ENCRYPTION_KEY)
  return bytes.toString(crypto.enc.Utf8)
}

/**
 * Origin 검증
 * @param origin - 검증할 origin
 * @returns 허용된 origin인지 여부
 */
export function isAllowedOrigin(origin: string): boolean {
  const allowedOrigins = [
    'https://github.com',
    'https://subdomain.company-internal.com',
  ]
  // 정확히 일치하거나
  if (allowedOrigins.includes(origin)) return true
  // 허용된 도메인의 서브도메인인 경우
  return allowedOrigins.some(allowed => {
    const domain = allowed.replace('https://', '')
    return origin.includes(`.${domain}`) || origin === allowed
  })
}

/**
 * 입력값 검증 및 새니타이징
 * @param input - 사용자 입력값
 * @returns 안전한 문자열
 */
export function sanitizeInput(input: string): string {
  // 위험한 문자 이스케이프 (태그 제거 전에 먼저 이스케이프)
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * CSP 논스 생성
 * @returns CSP 논스
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.lib.WordArray.random(16)
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
}

/**
 * 요청 서명 생성 (HMAC)
 * @param data - 서명할 데이터
 * @param secret - 비밀 키
 * @returns HMAC 서명
 */
export function generateRequestSignature(data: any, secret: string): string {
  const message = JSON.stringify(data)
  return crypto.HmacSHA256(message, secret).toString()
}

/**
 * 세션 토큰 검증
 * @param token - 검증할 토큰
 * @returns 유효한 토큰인지 여부
 */
export function validateSessionToken(token: string): boolean {
  try {
    // JWT 토큰 형식 검증 (간단한 예시)
    const parts = token.split('.')
    if (parts.length !== 3) return false
    // 헤더와 페이로드 디코딩
    const header = JSON.parse(atob(parts[0]))
    const payload = JSON.parse(atob(parts[1]))
    // 만료 시간 검증
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false
    }
    // 알고리즘 검증
    if (header.alg !== 'HS256' && header.alg !== 'RS256') {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * 민감한 데이터 마스킹
 * @param data - 마스킹할 데이터
 * @param fields - 마스킹할 필드 목록
 * @returns 마스킹된 데이터
 */
export function maskSensitiveData(data: any, fields: string[]): any {
  const masked = { ...data }
  
  fields.forEach(field => {
    if (masked[field]) {
      const value = String(masked[field])
      if (value.length <= 6) {
        // 짧은 값은 전체 마스킹
        masked[field] = '*'.repeat(value.length)
      } else {
        // 긴 값은 처음 2글자와 마지막 2글자만 표시
        const visibleCount = 2
        const maskedCount = value.length - (visibleCount * 2)
        masked[field] = value.slice(0, visibleCount) + '*'.repeat(maskedCount) + value.slice(-visibleCount)
      }
    }
  })
  
  return masked
}

/**
 * 안전한 로깅
 * @param level - 로그 레벨
 * @param message - 로그 메시지
 * @param data - 추가 데이터
 */
export function secureLog(level: 'info' | 'warn' | 'error', message: string, data?: any) {
  const sanitizedData = data ? maskSensitiveData(data, ['apiKey', 'password', 'token', 'sessionId']) : undefined
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message: sanitizeInput(message),
    data: sanitizedData
  }
  
  // 프로덕션에서는 중앙 로깅 시스템으로 전송
  if (import.meta.env?.MODE === 'production') {
    // 중앙 로깅 시스템 전송 로직
  } else {
    console[level](logEntry)
  }
} 