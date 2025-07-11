# ∇ AI Assistant - 은행 사내 배포 가이드

## 개요
본 문서는 ∇ AI Assistant를 은행 사내 환경에 안전하게 배포하기 위한 종합 가이드입니다.

## 목차
1. [보안 검토 사항](#보안-검토-사항)
2. [테스트 전략](#테스트-전략)
3. [플로팅 UI 활용](#플로팅-ui-활용)
4. [배포 프로세스](#배포-프로세스)
5. [운영 가이드](#운영-가이드)

## 보안 검토 사항

### 1. 권한 및 접근 제어
✅ **구현 완료**
- 사내 도메인으로 제한된 host_permissions
- 최소 권한 원칙 적용
- Content Script 실행 도메인 제한

### 2. 데이터 보안
✅ **구현 완료**
- AES-256 암호화를 통한 API 키 보호
- 민감한 데이터 자동 마스킹
- 세션 토큰 검증 메커니즘

### 3. 통신 보안
✅ **구현 완료**
- HTTPS 전용 통신
- HMAC-SHA256 요청 서명
- Rate Limiting (분당 30회)
- CORS 정책 적용

### 4. 코드 보안
✅ **구현 완료**
- XSS 방지를 위한 입력값 새니타이징
- CSP 헤더 설정
- postMessage origin 검증

### 5. 감사 및 로깅
✅ **구현 완료**
- 모든 API 요청/응답 로깅
- 민감 정보 자동 마스킹
- 사용자 행동 추적 (익명화)

## 테스트 전략

### 1. 단위 테스트
```bash
# 전체 테스트 실행
pnpm test

# 커버리지 포함
pnpm test:coverage

# UI 모드로 실행
pnpm test:ui
```

**주요 테스트 영역:**
- 보안 유틸리티 함수
- 암호화/복호화 로직
- 입력값 검증
- 세션 관리

### 2. 컴포넌트 테스트
- FloatingUI 상호작용
- ChatApp 기능
- 키보드 단축키
- 에러 처리

### 3. E2E 보안 테스트
- 도메인 제한 검증
- XSS 방지 확인
- Rate Limiting 동작
- CSP 정책 준수

### 4. 성능 테스트
- 응답 시간: < 3초
- 메모리 사용량: < 50MB
- CPU 사용률: < 5%

## 플로팅 UI 활용

### 1. 핵심 기능
- **자동 활성화**: 텍스트 선택 시 즉시 표시
- **4가지 AI 기능**: 요약, 번역, 다시쓰기, 설명
- **빠른 실행**: 원클릭으로 AI 처리

### 2. 은행 업무 활용 사례

#### 개인금융
- 대출 약관 요약
- 투자 상품 설명서 간소화
- 고객 안내문 작성

#### 기업금융
- 계약서 핵심 조항 추출
- 영문 신용평가 보고서 번역
- 제안서 톤 개선

#### 국제금융
- SWIFT 메시지 번역
- 국제 규정 요약
- 다국어 문서 처리

#### 리스크 관리
- 복잡한 리스크 지표 설명
- 감사 보고서 재작성
- 규정 변경사항 요약

### 3. 생산성 지표
- 문서 검토 시간: 50% 단축
- 번역 작업: 90% 시간 절약
- 문서 작성: 60% 효율 향상

## 배포 프로세스

### 1. 빌드 준비
```bash
# 의존성 설치
pnpm install

# 프로덕션 빌드
pnpm run build

# 보안 검사
pnpm run security:check
```

### 2. 환경 설정
```env
# .env.production
ENCRYPTION_KEY=your-encryption-key
API_ENDPOINT=https://internal-ai-api.company.com
SIGNATURE_SECRET=your-signature-secret
```

### 3. Chrome 정책 배포
```json
{
  "ExtensionSettings": {
    "lovebug-extension-id": {
      "installation_mode": "force_installed",
      "update_url": "https://internal-update.company.com",
      "runtime_blocked_hosts": ["*://*.external.com"]
    }
  }
}
```

### 4. 배포 체크리스트
- [ ] 모든 테스트 통과
- [ ] 보안 스캔 완료
- [ ] 코드 리뷰 승인
- [ ] 프로덕션 설정 확인
- [ ] 모니터링 준비
- [ ] 롤백 계획 수립

## 운영 가이드

### 1. 모니터링
- **대시보드**: Grafana/Kibana 활용
- **알림**: 임계값 초과 시 자동 알림
- **로그 분석**: 일일 보고서 생성

### 2. 유지보수
- **정기 업데이트**: 월 1회
- **보안 패치**: 즉시 적용
- **성능 최적화**: 분기별 검토

### 3. 사용자 지원
- **교육 자료**: 온라인 가이드 제공
- **헬프데스크**: 전담 지원팀 운영
- **피드백 수집**: 월간 설문조사

### 4. 인시던트 대응
1. **탐지**: 자동 모니터링
2. **격리**: 문제 확장 방지
3. **분석**: 원인 파악
4. **복구**: 서비스 정상화
5. **보고**: 사후 분석 보고서

## 주요 연락처
- **보안팀**: security@company.com
- **IT 운영팀**: it-ops@company.com
- **헬프데스크**: help@company.com
- **긴급 연락처**: +82-2-XXXX-XXXX

## 부록

### A. 보안 설정 파일
- `src/manifest-secure.json`: 보안 강화 manifest
- `src/utils/security.ts`: 보안 유틸리티
- `src/utils/sse-secure.ts`: 보안 통신 모듈

### B. 테스트 파일
- `src/tests/utils/security.test.ts`: 보안 단위 테스트
- `src/tests/components/FloatingUI.test.tsx`: UI 테스트
- `src/tests/e2e/security.e2e.test.ts`: E2E 보안 테스트

### C. 문서
- `docs/SECURITY_GUIDE.md`: 보안 가이드
- `docs/FLOATING_UI_GUIDE.md`: UI 활용 가이드
- `docs/ENTERPRISE_DEPLOYMENT.md`: 본 문서 