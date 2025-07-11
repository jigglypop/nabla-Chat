# 농협은행 ∇ AI Assistant 기술 가이드

## 목차
1. [시스템 아키텍처](#시스템-아키텍처)
2. [보안 구현](#보안-구현)
3. [농협 시스템 연동](#농협-시스템-연동)
4. [성능 최적화](#성능-최적화)
5. [모니터링 및 로깅](#모니터링-및-로깅)
6. [트러블슈팅](#트러블슈팅)

## 시스템 아키텍처

### 1. 전체 구조
```
┌─────────────────────────────────────────────────────────────────┐
│                        농협은행 사내망                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────┐     ┌───────────────┐     ┌──────────────┐ │
│  │   브라우저      │     │   AI 플랫폼    │     │   로그 서버   │ │
│  │  Extension    │────▶│ (NH AI API)   │────▶│  (감사로그)  │ │
│  └───────────────┘     └───────────────┘     └──────────────┘ │
│          │                      │                      │        │
│          ▼                      ▼                      ▼        │
│  ┌───────────────┐     ┌───────────────┐     ┌──────────────┐ │
│  │   NH-SSO      │     │     HSM       │     │   SIEM       │ │
│  │ (통합인증)     │     │ (키 관리)      │     │ (보안관제)    │ │
│  └───────────────┘     └───────────────┘     └──────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. 컴포넌트 상세

#### A. Browser Extension (클라이언트)
```typescript
// 주요 컴포넌트 구조
src/
├── background.ts      // 서비스 워커 (메시지 중계)
├── content.tsx       // 컨텐츠 스크립트 (DOM 조작)
├── components/       // React 컴포넌트
│   ├── ChatApp/     // 메인 채팅 UI
│   └── FloatingUI/  // 플로팅 결과 UI
├── plugins/         // 기능 플러그인
│   └── features/    
│       └── nh-*.ts  // 농협 특화 기능
├── utils/           // 유틸리티
│   ├── security.ts  // 보안 기능
│   └── sse-secure.ts// 보안 SSE 클라이언트
└── config/
    └── nh-config.ts // 농협 설정
```

#### B. NH AI Platform (서버)
- **엔드포인트**: https://ai-api.nonghyup.local/v1
- **인증**: OAuth 2.0 + NH-SSO
- **프로토콜**: HTTPS only (TLS 1.3)
- **형식**: JSON/SSE

#### C. 보안 인프라
- **HSM**: 암호화 키 관리
- **SIEM**: 실시간 보안 모니터링
- **DLP**: 데이터 유출 방지

## 보안 구현

### 1. 암호화
```typescript
// AES-256-GCM 암호화 구현
import CryptoJS from 'crypto-js'

export class NHEncryption {
  private static readonly ALGORITHM = 'AES-256-GCM'
  private static readonly KEY_SIZE = 256
  private static readonly IV_SIZE = 16
  
  // HSM 연동 키 획득
  static async getKeyFromHSM(keyId: string): Promise<string> {
    const response = await fetch('https://hsm.nonghyup.local/keys', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getHSMToken()}`,
        'X-Key-ID': keyId
      }
    })
    return response.json()
  }
  
  // 데이터 암호화
  static encrypt(data: string, key: string): EncryptedData {
    const iv = CryptoJS.lib.WordArray.random(this.IV_SIZE)
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    })
    
    return {
      ciphertext: encrypted.toString(),
      iv: iv.toString(),
      tag: encrypted.tag.toString()
    }
  }
}
```

### 2. 인증 및 인가
```typescript
// NH-SSO 연동
export class NHAuth {
  private static readonly SSO_URL = 'https://auth.nhbank.com/oauth'
  
  // SSO 로그인
  static async login(): Promise<AuthToken> {
    const params = new URLSearchParams({
      client_id: NH_CONFIG.oauth.clientId,
      redirect_uri: chrome.runtime.getURL('auth-callback.html'),
      response_type: 'code',
      scope: 'ai-assistant employee-info'
    })
    
    const authUrl = `${this.SSO_URL}/authorize?${params}`
    const authCode = await this.launchAuthFlow(authUrl)
    
    return this.exchangeCodeForToken(authCode)
  }
  
  // 토큰 갱신
  static async refreshToken(refreshToken: string): Promise<AuthToken> {
    const response = await fetch(`${this.SSO_URL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: NH_CONFIG.oauth.clientId,
        client_secret: await this.getClientSecret()
      })
    })
    
    return response.json()
  }
}
```

### 3. 데이터 분류 및 처리
```typescript
// 데이터 등급별 처리
export class DataClassification {
  static classify(text: string): DataGrade {
    // 패턴 매칭으로 데이터 등급 판별
    const patterns = {
      극비: [
        /\d{6}-\d{7}/,          // 주민번호
        /\d{4}-\d{4}-\d{4}-\d{4}/, // 카드번호
        /계좌번호.*\d{10,}/     // 계좌번호
      ],
      대외비: [
        /영업전략/, /경영계획/, /인사정보/
      ],
      내부용: [
        /직원/, /부서/, /내부/
      ]
    }
    
    for (const [grade, patterns] of Object.entries(patterns)) {
      if (patterns.some(p => p.test(text))) {
        return grade as DataGrade
      }
    }
    
    return '공개'
  }
  
  static processData(text: string, grade: DataGrade): ProcessedData {
    switch (grade) {
      case '극비':
        throw new Error('극비 데이터는 처리할 수 없습니다')
      
      case '대외비':
        return {
          data: this.encrypt(text),
          encrypted: true,
          masking: false
        }
      
      case '내부용':
        return {
          data: this.maskSensitive(text),
          encrypted: false,
          masking: true
        }
      
      default:
        return {
          data: text,
          encrypted: false,
          masking: false
        }
    }
  }
}
```

## 농협 시스템 연동

### 1. AI 플랫폼 연동
```typescript
// NH AI API 클라이언트
export class NHAIClient {
  private baseURL = NH_CONFIG.api.base
  private session: NHSession
  
  async request(endpoint: string, data: any): Promise<any> {
    const signature = await this.generateSignature(data)
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.session.token}`,
        'X-NH-Department': this.session.department,
        'X-NH-User-ID': this.session.userId,
        'X-Signature': signature,
        'X-Request-ID': generateRequestId(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new NHAPIError(response.status, await response.text())
    }
    
    return response.json()
  }
  
  // 스트리밍 응답 처리
  async stream(endpoint: string, data: any): AsyncGenerator<string> {
    const response = await this.request(endpoint, {
      ...data,
      stream: true
    })
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6))
          yield data.content
        }
      }
    }
  }
}
```

### 2. 업무 시스템 연동
```typescript
// 여신 시스템 연동
export class LoanSystemIntegration {
  static async getLoanInfo(loanNumber: string): Promise<LoanInfo> {
    const response = await fetch('https://loan.nonghyup.local/api/loans', {
      headers: {
        'Authorization': getNHSystemToken(),
        'X-Loan-Number': loanNumber
      }
    })
    
    return response.json()
  }
  
  static async checkRegulation(loanData: LoanData): Promise<RegulationResult> {
    return nhAIClient.request('/loan/regulation-check', {
      loanType: loanData.type,
      amount: loanData.amount,
      customerGrade: loanData.customerGrade,
      collateral: loanData.collateral
    })
  }
}

// 그룹웨어 연동
export class GroupwareIntegration {
  static async getUserInfo(): Promise<NHUser> {
    const response = await fetch('https://gw.nhbank.com/api/user/me', {
      headers: {
        'Authorization': getGroupwareToken()
      }
    })
    
    return response.json()
  }
}
```

## 성능 최적화

### 1. 캐싱 전략
```typescript
// 메모리 캐시 + IndexedDB
export class NHCache {
  private memoryCache = new Map<string, CacheEntry>()
  private db: IDBDatabase
  
  async get(key: string): Promise<any> {
    // 1. 메모리 캐시 확인
    const memEntry = this.memoryCache.get(key)
    if (memEntry && !this.isExpired(memEntry)) {
      return memEntry.data
    }
    
    // 2. IndexedDB 확인
    const dbEntry = await this.getFromDB(key)
    if (dbEntry && !this.isExpired(dbEntry)) {
      // 메모리 캐시 갱신
      this.memoryCache.set(key, dbEntry)
      return dbEntry.data
    }
    
    return null
  }
  
  async set(key: string, data: any, ttl: number): Promise<void> {
    const entry: CacheEntry = {
      data,
      expiry: Date.now() + ttl,
      size: this.getSize(data)
    }
    
    // 메모리 캐시 크기 관리
    if (this.getMemoryUsage() > MAX_MEMORY_CACHE) {
      this.evictLRU()
    }
    
    this.memoryCache.set(key, entry)
    await this.saveToB(key, entry)
  }
}
```

### 2. 요청 최적화
```typescript
// 요청 배치 처리
export class RequestBatcher {
  private queue: BatchRequest[] = []
  private timer: NodeJS.Timeout | null = null
  
  async add(request: BatchRequest): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ ...request, resolve, reject })
      
      if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), 100)
      }
      
      if (this.queue.length >= 10) {
        this.flush()
      }
    })
  }
  
  private async flush() {
    if (this.queue.length === 0) return
    
    const batch = this.queue.splice(0, 10)
    this.timer = null
    
    try {
      const results = await nhAIClient.request('/batch', {
        requests: batch.map(r => ({
          id: r.id,
          endpoint: r.endpoint,
          data: r.data
        }))
      })
      
      batch.forEach((req, i) => {
        req.resolve(results[i])
      })
    } catch (error) {
      batch.forEach(req => req.reject(error))
    }
  }
}
```

## 모니터링 및 로깅

### 1. 성능 모니터링
```typescript
// 성능 메트릭 수집
export class PerformanceMonitor {
  static trackAPICall(endpoint: string, duration: number): void {
    const metric = {
      endpoint,
      duration,
      timestamp: Date.now(),
      department: getCurrentDepartment(),
      userId: getCurrentUserId()
    }
    
    // 로컬 버퍼에 저장
    this.buffer.push(metric)
    
    // 주기적으로 서버로 전송
    if (this.buffer.length >= 100) {
      this.flush()
    }
  }
  
  private static async flush(): Promise<void> {
    const metrics = this.buffer.splice(0, 100)
    
    await fetch('https://monitor.nonghyup.local/metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'lovebug-extension'
      },
      body: JSON.stringify({ metrics })
    })
  }
}
```

### 2. 감사 로깅
```typescript
// 감사 로그 관리
export class AuditLogger {
  static async log(event: AuditEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: event.userId,
      department: event.department,
      action: event.action,
      resource: event.resource,
      result: event.result,
      ip: await this.getClientIP(),
      sessionId: getSessionId()
    }
    
    // 중요 이벤트는 즉시 전송
    if (event.severity === 'HIGH') {
      await this.sendImmediate(logEntry)
    } else {
      // 일반 이벤트는 배치 처리
      this.queueLog(logEntry)
    }
  }
  
  private static async sendImmediate(log: AuditLog): Promise<void> {
    await fetch('https://log.nonghyup.local/audit/immediate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Priority': 'HIGH'
      },
      body: JSON.stringify(log)
    })
  }
}
```

## 트러블슈팅

### 1. 일반적인 문제 해결

#### A. 연결 오류
```typescript
// 연결 재시도 로직
export class ConnectionManager {
  private retryCount = 0
  private maxRetries = 3
  
  async connect(): Promise<void> {
    try {
      await this.establishConnection()
      this.retryCount = 0
    } catch (error) {
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        const delay = Math.min(1000 * Math.pow(2, this.retryCount), 10000)
        
        console.log(`연결 실패. ${delay}ms 후 재시도... (${this.retryCount}/${this.maxRetries})`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.connect()
      }
      
      throw new Error(`연결 실패: ${error.message}`)
    }
  }
}
```

#### B. 인증 오류
```typescript
// 인증 오류 처리
export class AuthErrorHandler {
  static async handle(error: AuthError): Promise<void> {
    switch (error.code) {
      case 'TOKEN_EXPIRED':
        // 토큰 갱신 시도
        try {
          const newToken = await NHAuth.refreshToken(getRefreshToken())
          saveToken(newToken)
          return
        } catch (refreshError) {
          // 재로그인 필요
          await this.redirectToLogin()
        }
        break
        
      case 'INVALID_CREDENTIALS':
        await this.showError('인증 정보가 올바르지 않습니다.')
        await this.redirectToLogin()
        break
        
      case 'SESSION_TIMEOUT':
        await this.showError('세션이 만료되었습니다.')
        await this.redirectToLogin()
        break
    }
  }
}
```

### 2. 디버깅 도구

#### A. 개발자 콘솔 명령어
```javascript
// 농협 전용 디버깅 명령어
window.nhDebug = {
  // 현재 상태 확인
  status: () => {
    return {
      auth: NHAuth.isAuthenticated(),
      connection: NHAIClient.isConnected(),
      cache: NHCache.getStats(),
      performance: PerformanceMonitor.getMetrics()
    }
  },
  
  // 캐시 초기화
  clearCache: async () => {
    await NHCache.clear()
    console.log('캐시가 초기화되었습니다.')
  },
  
  // 로그 레벨 변경
  setLogLevel: (level) => {
    NH_CONFIG.logging.level = level
    console.log(`로그 레벨이 ${level}로 변경되었습니다.`)
  },
  
  // 테스트 요청
  testAPI: async (endpoint) => {
    const start = performance.now()
    try {
      const result = await NHAIClient.request(endpoint, { test: true })
      const duration = performance.now() - start
      console.log(`성공: ${duration.toFixed(2)}ms`, result)
    } catch (error) {
      console.error('실패:', error)
    }
  }
}
```

#### B. 네트워크 진단
```typescript
// 네트워크 상태 진단
export class NetworkDiagnostics {
  static async runDiagnostics(): Promise<DiagnosticReport> {
    const report: DiagnosticReport = {
      timestamp: new Date().toISOString(),
      checks: []
    }
    
    // 1. 프록시 연결 확인
    report.checks.push(await this.checkProxy())
    
    // 2. AI API 연결 확인
    report.checks.push(await this.checkAPIConnection())
    
    // 3. SSO 연결 확인
    report.checks.push(await this.checkSSOConnection())
    
    // 4. 응답 시간 측정
    report.checks.push(await this.measureLatency())
    
    // 5. 대역폭 테스트
    report.checks.push(await this.testBandwidth())
    
    return report
  }
  
  private static async checkProxy(): Promise<DiagnosticCheck> {
    try {
      const response = await fetch('https://proxy.nonghyup.com/health')
      return {
        name: '프록시 연결',
        status: response.ok ? 'OK' : 'FAIL',
        details: `상태 코드: ${response.status}`
      }
    } catch (error) {
      return {
        name: '프록시 연결',
        status: 'FAIL',
        details: error.message
      }
    }
  }
}
```

### 3. 로그 분석
```bash
# 로그 파일 위치
/var/log/nonghyup/lovebug/
├── access.log    # 접근 로그
├── error.log     # 에러 로그
├── audit.log     # 감사 로그
└── performance.log # 성능 로그

# 로그 분석 예시
# 특정 사용자의 활동 추적
grep "userId:NH12345" /var/log/nonghyup/lovebug/audit.log

# 에러 빈도 분석
awk '{print $5}' error.log | sort | uniq -c | sort -nr

# 성능 저하 구간 찾기
awk '$4 > 1000 {print $0}' performance.log
```
