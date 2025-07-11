# 농협은행 ∇ AI Assistant 사내 배포 가이드

## 목차
1. [개요](#개요)
2. [농협은행 IT 환경 고려사항](#농협은행-it-환경-고려사항)
3. [보안 준수 사항](#보안-준수-사항)
4. [배포 프로세스](#배포-프로세스)
5. [농협 업무 특화 기능](#농협-업무-특화-기능)
6. [운영 및 관리](#운영-및-관리)

## 개요

∇ AI Assistant는 농협은행 직원들의 업무 효율성을 극대화하기 위해 개발된 브라우저 확장 프로그램입니다. 농협은행의 엄격한 보안 정책과 IT 인프라를 고려하여 설계되었습니다.

### 주요 특징
- **농협 사내망 전용**: `*.nonghyup.com`, `*.nhbank.com` 도메인에서만 작동
- **NH AI 플랫폼 연동**: 농협 자체 AI 서비스 활용
- **강화된 보안**: 금융보안원 가이드라인 100% 준수
- **오프라인 모드**: 사내망 격리 환경 지원

## 농협은행 IT 환경 고려사항

### 1. 네트워크 환경
```yaml
내부 도메인:
  - 업무 포털: https://portal.nonghyup.com
  - 그룹웨어: https://gw.nhbank.com
  - AI 플랫폼: https://ai.nonghyup.local
  - 문서관리: https://edms.nhbank.com

프록시 설정:
  - HTTP: proxy.nonghyup.com:8080
  - HTTPS: proxy.nonghyup.com:8443
  - 예외: localhost, *.nonghyup.local
```

### 2. 브라우저 정책
- **지원 브라우저**: Chrome Enterprise 115+, Edge for Business 115+
- **관리자 권한**: GPO(그룹 정책)로 중앙 관리
- **자동 업데이트**: 보안팀 승인 후 단계적 배포

### 3. 인증 체계
- **SSO 연동**: 농협 통합인증시스템(NH-SSO)
- **인증서**: 농협 전용 공인인증서/금융인증서
- **2FA**: OTP 필수 적용

## 보안 준수 사항

### 1. 금융보안원 가이드라인 준수
✅ **전자금융감독규정 준수**
- 제21조(단말기 보안)
- 제31조(정보처리시스템 보안)
- 제37조(전자금융거래 프로그램 보안)

✅ **개인정보보호법 준수**
- 고객 정보 수집/이용 최소화
- 암호화 전송/저장
- 접근 권한 관리

### 2. 농협 자체 보안 정책
```javascript
// 농협 보안 정책 설정
const NH_SECURITY_CONFIG = {
  // API 엔드포인트 화이트리스트
  allowedEndpoints: [
    'https://ai-api.nonghyup.local/v1/*',
    'https://auth.nhbank.com/oauth/*'
  ],
  
  // 데이터 보안
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotation: '30days',
    keyStorage: 'HSM' // Hardware Security Module
  },
  
  // 로깅 정책
  logging: {
    level: 'INFO',
    retention: '5years',
    anonymization: true
  }
}
```

### 3. 데이터 분류 및 처리
| 데이터 등급 | 처리 방법 | 예시 |
|-----------|---------|------|
| 1등급(극비) | 처리 불가 | 고객 금융정보 |
| 2등급(대외비) | 암호화 처리 | 내부 영업전략 |
| 3등급(내부용) | 마스킹 처리 | 직원 정보 |
| 4등급(공개) | 일반 처리 | 상품 안내 |

## 배포 프로세스

### 1. 사전 준비
```bash
# 1. 보안 검토 신청
- 정보보호부: security@nonghyup.com
- IT기획부: itplan@nonghyup.com

# 2. 필요 문서
- 보안성 검토 결과서
- 개인정보 영향평가서
- 시스템 연동 신청서
```

### 2. 빌드 및 패키징
```bash
# 농협 전용 빌드
NODE_ENV=nh-production pnpm run build:nh

# 서명
signtool sign /f "NH-Code-Certificate.pfx" /p $CERT_PASSWORD dist/lovebug-nh.crx
```

### 3. 배포 방법

#### A. GPO를 통한 일괄 배포
```json
{
  "3rdparty": {
    "extensions": {
      "nh-lovebug-extension-id": {
        "installation_mode": "force_installed",
        "update_url": "https://extension.nonghyup.local/lovebug/update.xml",
        "runtime_blocked_hosts": [
          "*://*.com/*",
          "*://*.net/*"
        ],
        "runtime_allowed_hosts": [
          "*://*.nonghyup.com/*",
          "*://*.nhbank.com/*",
          "*://*.nonghyup.local/*"
        ]
      }
    }
  }
}
```

#### B. 자가 설치 (파일럿 테스트)
1. 내부 포털 접속: https://portal.nonghyup.com/it/tools
2. "AI 도구" → "∇ 설치"
3. 설치 가이드 따라 진행

### 4. 검증 프로세스
- **1단계**: IT운영부 기능 테스트 (1주)
- **2단계**: 보안팀 취약점 점검 (2주)
- **3단계**: 파일럿 부서 운영 (1개월)
- **4단계**: 전사 확대 배포

## 농협 업무 특화 기능

### 1. 여신 업무 지원
```typescript
// 대출 심사 문서 분석
const loanAnalysis = {
  features: [
    '신용평가서 자동 요약',
    '담보 감정평가서 핵심 추출',
    '재무제표 분석 및 비율 계산',
    '여신 규정 자동 체크'
  ],
  
  api: 'https://ai-api.nonghyup.local/v1/loan/analyze'
}
```

### 2. 수신 업무 지원
- **상품 추천**: 고객 프로필 기반 맞춤 상품
- **약관 설명**: 복잡한 약관을 쉬운 말로 변환
- **금리 계산**: 복리/단리 자동 계산
- **세금 안내**: 절세 상품 추천

### 3. 외환 업무 지원
- **환율 조회**: 실시간 환율 정보
- **SWIFT 번역**: 자동 번역 및 검증
- **규정 확인**: 외환 규정 즉시 조회
- **서류 작성**: 외환 서류 자동 생성

### 4. 디지털 금융
```javascript
// NH올원뱅크 연동
const digitalBanking = {
  '모바일앱_이슈': '고객 문의 자동 분류',
  '디지털상품_설명': 'QR/NFC 결제 상품 안내',
  '오류_대응': '시스템 오류 대응 가이드',
  'API_문서화': '오픈뱅킹 API 문서 생성'
}
```

### 5. 농협 특화 업무
- **농업금융**: 농업 정책자금 안내, 농산물 가격 정보
- **축산금융**: 축산 정책자금, 가축 시세 정보
- **상호금융**: 조합 업무 지원, 조합원 관리
- **카드사업**: 카드 상품 비교, 혜택 분석

## 운영 및 관리

### 1. 모니터링 대시보드
```yaml
모니터링 URL: https://monitor.nonghyup.local/lovebug

주요 지표:
  - 일일 사용자 수
  - API 호출 횟수
  - 평균 응답 시간
  - 오류율
  - 부서별 사용 현황
```

### 2. 사용자 지원
- **헬프데스크**: 1588-2100 (내선 7777)
- **온라인 매뉴얼**: https://portal.nonghyup.com/help/lovebug
- **교육 영상**: NH러닝센터 > IT교육 > AI도구활용
- **FAQ**: 자주 묻는 질문 50선

### 3. 피드백 수집
```javascript
// 사용자 피드백 API
POST https://feedback.nonghyup.local/api/lovebug
{
  "userId": "NH12345",
  "department": "여신기획부",
  "feedbackType": "improvement",
  "content": "대출 심사 시 신용평가 요약 기능 추가 요청"
}
```

### 4. 업데이트 정책
- **정기 업데이트**: 매월 둘째 주 화요일
- **긴급 패치**: 보안 이슈 발생 시 즉시
- **기능 추가**: 분기별 사용자 요구사항 반영

### 5. 성과 측정
| 지표 | 목표 | 측정 방법 |
|------|-----|----------|
| 업무 시간 단축 | 30% | 작업 완료 시간 |
| 오류 감소 | 50% | 품질 점검 결과 |
| 사용자 만족도 | 90% | 분기별 설문 |
| ROI | 200% | 비용 대비 효익 |

## 주요 연락처

### 기술 지원
- **IT헬프데스크**: ithelpdesk@nonghyup.com
- **AI플랫폼팀**: ai-platform@nonghyup.com
- **정보보호부**: security@nonghyup.com

### 비즈니스 문의
- **디지털혁신부**: digital@nonghyup.com
- **IT기획부**: itplan@nonghyup.com

### 긴급 연락처
- **장애 신고**: 1588-2100 (24시간)
- **보안 사고**: 02-2080-5114

## 부록

### A. 설치 문제 해결
1. 설치 실패 시
   - 브라우저 버전 확인
   - 관리자 권한 확인
   - 프록시 설정 확인

2. 실행 오류 시
   - 캐시 삭제
   - 확장 프로그램 재설치
   - IT헬프데스크 문의

### B. 자주 사용하는 단축키
- `Ctrl+Shift+N`: 새 AI 대화
- `Ctrl+Shift+H`: 도움말
- `Ctrl+Shift+S`: 설정
- `Esc`: 닫기

### C. 교육 일정
- 신입 직원: 입행 교육 시 필수
- 기존 직원: e-러닝 과정 수강
- 심화 과정: 부서별 맞춤 교육 