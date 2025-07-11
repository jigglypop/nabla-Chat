# ∇ AI Assistant - 은행 사내 보안 가이드

## 목차
1. [보안 개요](#보안-개요)
2. [보안 체크리스트](#보안-체크리스트)
3. [구현된 보안 기능](#구현된-보안-기능)
4. [배포 및 관리](#배포-및-관리)
5. [감사 및 모니터링](#감사-및-모니터링)

## 보안 개요

은행 환경에서 브라우저 확장 프로그램은 높은 수준의 보안이 요구됩니다. 본 문서는 ∇ AI Assistant를 사내 환경에 안전하게 배포하기 위한 가이드입니다.

### 주요 보안 원칙
- **최소 권한 원칙**: 필요한 최소한의 권한만 요청
- **데이터 암호화**: 모든 민감한 데이터는 암호화하여 저장/전송
- **접근 제어**: 사내 도메인에서만 동작하도록 제한
- **감사 로깅**: 모든 중요 작업에 대한 로그 기록

## 보안 체크리스트

### 1. 권한 최소화 ✅
- [x] `<all_urls>` 권한 제거
- [x] 사내 도메인으로 `host_permissions` 제한
- [x] 불필요한 Chrome API 권한 제거
- [x] Content Script 실행 도메인 제한

### 2. 데이터 보호 ✅
- [x] API 키 암호화 저장 (AES-256)
- [x] 세션 토큰 검증 로직
- [x] 민감한 데이터 마스킹
- [x] Storage 접근 제한

### 3. 통신 보안 ✅
- [x] HTTPS 강제
- [x] CORS 정책 적용
- [x] 요청 서명 (HMAC-SHA256)
- [x] Rate Limiting

### 4. 코드 보안 ✅
- [x] XSS 방지 (입력값 새니타이징)
- [x] CSP(Content Security Policy) 설정
- [x] postMessage origin 검증
- [x] 안전한 DOM 조작

### 5. 인증 및 인가 ✅
- [x] JWT 토큰 검증
- [x] 세션 관리
- [x] 사용자 인증 연동

## 구현된 보안 기능

### 1. API 키 암호화
```typescript
// 암호화 저장
const encryptedKey = encryptApiKey(apiKey)
chrome.storage.sync.set({ apiKey: encryptedKey })

// 복호화 사용
const decryptedKey = decryptApiKey(encryptedKey)
```

### 2. 입력값 검증
```typescript
// XSS 방지를 위한 새니타이징
const safe = sanitizeInput(userInput)

// 길이 제한
if (input.length > MAX_LENGTH) {
  throw new Error('입력이 너무 깁니다')
}
```

### 3. 요청 서명
```typescript
// HMAC 서명으로 요청 무결성 보장
const signature = generateRequestSignature(data, secret)
headers['X-Signature'] = signature
```

### 4. Rate Limiting
```typescript
// 분당 30회 요청 제한
private readonly maxRequestsPerWindow = 30
private readonly rateLimitWindow = 60000 // 1분
```

### 5. 감사 로깅
```typescript
// 민감한 데이터 자동 마스킹
secureLog('info', 'API 요청', {
  userId: user.id,
  apiKey: user.apiKey // 자동으로 마스킹됨
})
```

## 배포 및 관리

### 1. 빌드 설정
```bash
# 프로덕션 빌드 (난독화 포함)
pnpm run build:prod

# 보안 검증
pnpm run security:check
```

### 2. 환경 변수
```env
# .env.production
ENCRYPTION_KEY=<사내 암호화 키>
API_ENDPOINT=https://internal-ai-api.company.com
SIGNATURE_SECRET=<서명 비밀 키>
```

### 3. 배포 체크리스트
- [ ] 모든 테스트 통과 확인
- [ ] 보안 스캔 실행
- [ ] 코드 리뷰 완료
- [ ] 프로덕션 환경 변수 설정
- [ ] 모니터링 대시보드 준비

### 4. Chrome 정책 설정
```json
{
  "ExtensionSettings": {
    "lovebug-extension-id": {
      "installation_mode": "force_installed",
      "update_url": "https://internal-update.company.com/extensions",
      "allowed_permissions": ["activeTab", "contextMenus", "storage"]
    }
  }
}
```

## 감사 및 모니터링

### 1. 로그 수집
- 모든 API 요청/응답
- 사용자 행동 (익명화)
- 에러 및 예외
- 보안 이벤트

### 2. 모니터링 지표
- API 요청 빈도
- 에러율
- 응답 시간
- 사용자별 사용량

### 3. 보안 이벤트 알림
- 비정상적인 요청 패턴
- 반복된 인증 실패
- Rate limit 초과
- 의심스러운 입력값

### 4. 정기 보안 점검
- 월간 취약점 스캔
- 분기별 침투 테스트
- 연간 전체 보안 감사

## 추가 권장사항

### 1. 사용자 교육
- 플러그인 사용 가이드
- 보안 주의사항
- 피싱 방지 교육

### 2. 인시던트 대응
- 보안 사고 대응 프로세스
- 긴급 패치 절차
- 사용자 통보 체계

### 3. 업데이트 관리
- 자동 업데이트 설정
- 버전 관리 정책
- 롤백 계획

## 문의 및 지원
- 보안팀: security@company.com
- IT 헬프데스크: it-help@company.com
- 긴급 연락처: +82-2-XXXX-XXXX 