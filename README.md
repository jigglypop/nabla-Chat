# Lovebug AI Assistant

AI 기반 브라우저 확장 프로그램으로, 텍스트 분석 및 처리 기능을 제공합니다.

## 🌟 주요 기능

- 📝 **텍스트 요약**: 긴 텍스트를 간결하게 요약
- 🌐 **번역**: 다국어 실시간 번역
- ✏️ **문장 개선**: 문법 및 스타일 개선
- 💡 **설명**: 복잡한 내용을 쉽게 설명
- 💬 **AI 채팅**: 대화형 AI 어시스턴트

## 🏦 농협은행 전용 배포

농협은행 사내 배포를 위한 특별 버전이 준비되어 있습니다.

### 농협은행 전용 문서
- [농협 배포 가이드](docs/NH_DEPLOYMENT_GUIDE.md) - 전체 배포 프로세스
- [기술 가이드](docs/NH_TECHNICAL_GUIDE.md) - 시스템 아키텍처 및 구현 상세
- [보안 체크리스트](docs/NH_SECURITY_CHECKLIST.md) - 금융 보안 규정 준수 사항
- [ROI 분석](docs/NH_ROI_ANALYSIS.md) - 투자 대비 효과 분석

### 농협 특화 기능
- 여신 업무 지원 (대출 심사 문서 분석)
- 수신 업무 지원 (상품 추천, 약관 설명)
- 외환 업무 지원 (SWIFT 번역, 환율 조회)
- 디지털 금융 (NH올원뱅크 연동)
- 농업 금융 (정책자금, 농산물 가격)

## 🚀 시작하기

### 요구사항
- Node.js 18+
- pnpm 8+
- Chrome 115+ 또는 Edge 115+

### 설치 방법

1. 저장소 클론
```bash
git clone https://github.com/lovebug/lovebug.git
cd lovebug
```

2. 의존성 설치
```bash
pnpm install
```

3. 빌드
```bash
# 일반 빌드
pnpm build

# 농협은행 전용 빌드
pnpm build:nh
```

4. Chrome에서 로드
   - `chrome://extensions/` 접속
   - "개발자 모드" 활성화
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - `dist` 폴더 선택

## 📂 프로젝트 구조

```
lovebug/
├── src/
│   ├── background.ts      # 서비스 워커
│   ├── content.tsx       # 컨텐츠 스크립트
│   ├── components/       # React 컴포넌트
│   │   ├── ChatApp/     # 채팅 UI
│   │   └── FloatingUI/  # 플로팅 UI
│   ├── plugins/         # 기능 플러그인
│   │   └── features/    
│   │       ├── nh-*.ts  # 농협 특화 기능
│   │       └── *.ts     # 기본 기능
│   ├── utils/           # 유틸리티
│   │   ├── security.ts  # 보안 기능
│   │   └── sse*.ts      # SSE 클라이언트
│   └── config/
│       └── nh-config.ts # 농협 설정
├── docs/                # 문서
├── tests/               # 테스트
└── public/             # 정적 파일
```

## 🧪 테스트

```bash
# 단위 테스트
pnpm test

# 테스트 커버리지
pnpm test:coverage

# E2E 테스트
pnpm test:e2e
```

## 🔒 보안

- AES-256-GCM 암호화
- HMAC 요청 서명
- 입력값 새니타이징
- Rate Limiting (30 req/min)
- 세션 타임아웃 (30분)
- 감사 로깅

자세한 내용은 [보안 가이드](docs/SECURITY_GUIDE.md)를 참조하세요.

## 📚 문서

### 일반 문서
- [기업 배포 가이드](docs/ENTERPRISE_DEPLOYMENT.md)
- [보안 가이드](docs/SECURITY_GUIDE.md)
- [플로팅 UI 가이드](docs/FLOATING_UI_GUIDE.md)
- [AI 플랫폼 아이디어](docs/AI_PLATFORM_IDEAS.md)
- [AI 플랫폼 퀵스타트](docs/AI_PLATFORM_QUICK_START.md)

### 농협은행 전용 문서
- [농협 배포 가이드](docs/NH_DEPLOYMENT_GUIDE.md)
- [농협 기술 가이드](docs/NH_TECHNICAL_GUIDE.md)
- [농협 보안 체크리스트](docs/NH_SECURITY_CHECKLIST.md)
- [농협 ROI 분석](docs/NH_ROI_ANALYSIS.md)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

### 일반 문의
- Email: support@lovebug.ai
- Website: https://lovebug.ai

### 농협은행 전용 지원
- IT헬프데스크: ithelpdesk@nonghyup.com
- AI플랫폼팀: ai-platform@nonghyup.com
- 장애 신고: 1588-2100 (24시간)

---

Made with ❤️ by Lovebug Team
