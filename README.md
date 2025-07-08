# Lovebug - AI-Powered Browser Assistant

Lovebug는 웹 브라우징 중 텍스트 선택 시 즉시 AI 지원을 제공하는 Chrome/Edge 확장 프로그램입니다.

## 주요 기능

### 1. 텍스트 선택 기능
- 웹페이지에서 텍스트 선택 시 자동으로 플로팅 메뉴 표시
- 다양한 AI 기능 제공:
  - **요약하기**: 선택한 텍스트를 간결하게 요약
  - **번역하기**: 선택한 텍스트를 한국어로 번역
  - **다시 쓰기**: 선택한 텍스트를 개선하여 다시 작성
  - **설명하기**: 선택한 텍스트에 대한 자세한 설명

### 2. 플로팅 채팅
- 우측 하단의 플로팅 버튼을 통해 언제든지 AI 채팅 접근 가능
- 웹페이지 내에서 직접 실행되는 채팅 인터페이스
- 최소화/최대화 기능 지원

### 3. 디자인 특징
- Glassmorphism 디자인 적용
- 그라디언트 배경 (#12c2e9 → #c471ed → #f64f59)
- Pretendard 폰트로 깔끔한 한글 표시
- 다크 테마 기반의 모던한 UI

## 기술 스택

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v3 (prefix: `lb-`)
- **Build Tool**: Vite
- **Extension**: Chrome Extension Manifest V3
- **Package Manager**: pnpm

## 설치 방법

### 1. 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/your-org/lovebug.git
cd lovebug

# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm run dev

# 빌드
pnpm run build
```

브라우저에서 `http://localhost:5173`을 열어 확장 프로그램을 개발합니다.

### 테스트 환경

개발 서버에서는 다음과 같은 테스트 환경을 제공합니다:

1. **텍스트 드래그 테스트**: 텍스트를 선택하면 Floating UI가 나타납니다
2. **채팅 버튼 테스트**: 버튼을 클릭하면 채팅창이 열립니다
3. **크롬 확장 아이콘 시뮬레이션**: 상단의 확장 아이콘을 클릭하면 팝업이 나타납니다

## 빌드

```bash
# 빌드
pnpm run build
```

### 2. Chrome/Edge에 설치

1. Chrome/Edge 브라우저에서 `chrome://extensions` 또는 `edge://extensions` 접속
2. 우측 상단 "개발자 모드" 활성화
3. "압축 해제된 확장 프로그램 로드" 클릭
4. 빌드된 `dist` 폴더 선택

## 프로젝트 구조

```
lovebug/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── ChatApp.tsx     # 메인 채팅 UI (Tailwind)
│   │   ├── FloatingUI.tsx  # 텍스트 선택 시 플로팅 메뉴
│   │   └── ...
│   ├── plugins/            # AI 기능 플러그인
│   │   ├── features/       # 개별 기능 구현
│   │   └── PluginManager.ts
│   ├── styles/             # CSS 파일
│   │   └── tailwind-chat.css
│   ├── types/              # TypeScript 타입 정의
│   ├── utils/              # 유틸리티 함수
│   ├── background.ts       # Service Worker
│   ├── content.tsx         # Content Script
│   └── manifest.json       # Extension manifest
├── dist/                   # 빌드 결과물
├── tailwind.config.js      # Tailwind 설정
├── postcss.config.js       # PostCSS 설정
├── vite.config.ts          # Vite 설정
└── package.json
```

## 개발 가이드

### 플러그인 추가하기

새로운 AI 기능을 추가하려면:

1. `src/plugins/features/` 디렉토리에 새 파일 생성
2. `Feature` 인터페이스 구현:

```typescript
import type { Feature } from '../../types/features'

export const myFeature: Feature = {
  id: 'my-feature',
  name: '새 기능',
  description: '새로운 AI 기능입니다',
  icon: '🚀',
  execute: async (text: string) => {
    // AI API 호출 로직
    return {
      success: true,
      data: '처리된 결과'
    }
  }
}
```

3. `PluginManager.ts`에 기능 등록

### API 연동

현재는 Mock 응답을 사용하고 있습니다. 실제 AI API 연동 시:

1. `src/utils/sse.ts`의 `createSSEClient` 함수에서 실제 API 엔드포인트 설정
2. 각 기능의 `execute` 함수에서 API 호출 구현

### 스타일 가이드

- 모든 Tailwind 클래스는 `lb-` prefix 사용 (충돌 방지)
- 커스텀 CSS는 최소화하고 Tailwind utilities 활용
- 애니메이션은 `tailwind.config.js`에 정의

## 주의사항

1. **CSS 충돌 방지**
   - Tailwind prefix (`lb-`) 사용
   - `all: initial` 사용으로 상속 차단
   - 고유한 ID 사용 (#lovebug-chat-wrapper)

2. **메모리 관리**
   - React 컴포넌트 unmount 시 정리
   - Event listener 제거
   - DOM 요소 제거

3. **보안**
   - Content Security Policy 준수
   - XSS 방지를 위한 innerHTML 사용 최소화
   - 사용자 입력 검증

## 라이선스

이 프로젝트는 내부 사용을 위해 개발되었습니다.

## 기여하기

1. Feature 브랜치 생성: `git checkout -b feature/amazing-feature`
2. 변경사항 커밋: `git commit -m 'Add amazing feature'`
3. 브랜치 푸시: `git push origin feature/amazing-feature`
4. Pull Request 생성

## 문제 해결

### 빌드 에러
- `pnpm install` 재실행
- `node_modules` 삭제 후 재설치

### 스타일 적용 안됨
- Chrome 확장 프로그램 다시 로드
- 캐시 삭제 (Ctrl+Shift+R)

### Tailwind 클래스 미적용
- `pnpm run build` 재실행
- `tailwind.config.js`의 content 경로 확인

## 기능 (Features)

- 🎯 **스마트 텍스트 선택**: 웹페이지에서 텍스트를 선택하면 자동으로 플로팅 UI가 나타납니다
  - 선택된 텍스트 끝 부분에 작은 그라디언트 버튼으로 표시
  - 마우스 호버 또는 Ctrl/Cmd 키를 누르면 전체 UI 확장
  - `Ctrl+Shift+A` (Mac: `Cmd+Shift+A`)로도 확장/축소 가능
- 🤖 **AI 어시스턴트**: 선택한 텍스트에 대해 다양한 AI 기능을 사용할 수 있습니다
  - 요약하기
  - 번역하기
  - 설명하기
  - 다시 쓰기
- 💬 **채팅 인터페이스**: 전체 화면 채팅으로 AI와 대화할 수 있습니다
  - 헤더를 드래그하여 창 위치 이동 가능
  - 모든 모서리와 가장자리에서 크기 조절 가능
  - 위치와 크기가 자동으로 저장되어 다음에 열 때 복원
  - 최소화/최대화 지원
  - 최대 크기는 뷰포트 크기로 제한
- ⚡ **빠른 반응 속도**: 최적화된 렌더링으로 부드러운 사용자 경험
- 🎨 **아름다운 UI**: 모던하고 직관적인 디자인
- ⌨️ **키보드 단축키**:
  - `Ctrl+Shift+A` (Mac: `Cmd+Shift+A`): 선택한 텍스트를 AI로 전송
  - `Ctrl+Shift+L` (Mac: `Cmd+Shift+L`): 채팅창 열기/닫기
  - `Ctrl+Shift+Up` (Mac: `Cmd+Shift+Up`): 채팅창 크게
  - `Ctrl+Shift+Down` (Mac: `Cmd+Shift+Down`): 채팅창 작게
- 🎨 **배경 테마**: Mac 스타일 신호등 버튼으로 6가지 배경 중 선택 가능
  - Sunset Ocean (분홍-주황-보라)
  - Aurora Night (하늘-보라-분홍)
  - Forest Dream (초록-하늘-파랑)
  - Midnight Purple (진한 보라)
  - Deep Ocean (진한 파랑)
  - Black Night (진한 검정)
