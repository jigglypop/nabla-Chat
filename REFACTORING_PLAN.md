# ∇·Chat 리팩토링 계획서

## 📋 개요
`lovebug`를 `∇·Chat (Nabla Chat)`으로 리브랜딩하며, 동시에 코드 구조를 components/hooks/containers 패턴으로 재구성합니다.

## 🎯 프로젝트 이름 변경

### 새 이름: ∇·Chat (Nabla Chat)
- **수학적 의미**: 
  - ∇ (나블라): 벡터 미분 연산자, 변화의 방향을 나타냄
  - Chat: AI와의 대화를 통한 텍스트 변환
- **프로젝트 의미**: AI가 텍스트의 의미 공간(semantic manifold)에서 최적의 변환 방향(gradient)을 찾아주는 대화형 도구

### 변경 대상 파일
1. `package.json` - name: "nabla-chat"
2. `src/manifest.json` - name: "∇·Chat", description: "AI-powered text transformation assistant"
3. `README.md` - 전체 내용
4. 모든 문서 파일의 lovebug 참조
5. CSS 클래스명 및 ID (lovebug-* → nabla-*)

## 🏗️ 아키텍처 리팩토링 계획

### 1. 현재 구조 분석

#### 현재 문제점
- `content.tsx`가 324줄로 너무 크고 복잡함
- 로직과 UI가 혼재되어 있음
- 전역 변수 사용으로 상태 관리가 불명확함
- 컴포넌트 간 책임이 불분명함
- SSE 구현이 있지만 사용되지 않음
- API 엔드포인트 설정 기능 부재
- 특정 배경색에서 가독성 문제

#### 개선 방향
- 관심사 분리 원칙 적용
- 단일 책임 원칙 준수
- 재사용 가능한 hooks 분리
- 상태 관리 중앙화
- React Query 도입으로 API 상태 관리
- 설정 가능한 API 엔드포인트
- 다크/라이트 모드별 가독성 개선

### 2. 새로운 구조 설계

```
src/
├── components/          # 순수 UI 컴포넌트
│   ├── Button/
│   ├── Icon/
│   ├── Tooltip/
│   ├── DraggableHeader/
│   ├── ResultDisplay/
│   └── SettingsModal/  # 설정 모달 추가
├── hooks/              # 커스텀 훅
│   ├── useFloatingUI/
│   ├── useTextSelection/
│   ├── usePluginExecution/
│   ├── useDraggable/
│   ├── useKeyboardShortcuts/
│   └── useAIChat/      # React Query 기반 AI 채팅 훅
└── containers/         # 비즈니스 로직 + 상태 관리
    ├── SelectionHandler/
    ├── PluginExecutor/
    ├── UIManager/
    └── SettingsManager/ # 설정 관리 컨테이너
```

### 3. 단계별 리팩토링 계획

#### Phase 1: 기반 작업 (1-2일)
1. **프로젝트 이름 변경**
   - [x] package.json, manifest.json 수정
   - [ ] README.md 업데이트
   - [ ] CSS 클래스명 변경 (lovebug → nabla)

2. **기본 컴포넌트 분리**
   - [ ] Icon 컴포넌트 생성 (SVG 아이콘 중앙화)
   - [ ] Button 컴포넌트 생성 (일관된 버튼 스타일)
   - [ ] Tooltip 컴포넌트 생성

3. **의존성 추가**
   - [ ] React Query 설치 및 설정
   - [ ] Axios 설치 (SSE 지원)

#### Phase 2: Hooks 분리 (2-3일)
1. **useTextSelection Hook**
   ```typescript
   // 텍스트 선택 감지 및 위치 계산
   interface UseTextSelectionReturn {
     selectedText: string | null;
     selectionPosition: { x: number; y: number } | null;
     activeElement: HTMLElement | null;
   }
   ```

2. **useFloatingUI Hook**
   ```typescript
   // FloatingUI 표시/숨김 및 위치 관리
   interface UseFloatingUIReturn {
     isVisible: boolean;
     position: { x: number; y: number };
     show: (selection: SelectionInfo) => void;
     hide: () => void;
   }
   ```

3. **usePluginExecution Hook**
   ```typescript
   // 플러그인 실행 로직
   interface UsePluginExecutionReturn {
     execute: (pluginId: string, text: string) => Promise<string>;
     isExecuting: boolean;
     result: string | null;
     error: Error | null;
   }
   ```

4. **useDraggable Hook**
   ```typescript
   // 드래그 기능 (이미 있는 useResize 개선)
   interface UseDraggableReturn {
     position: { x: number; y: number };
     isDragging: boolean;
     dragHandleProps: DragHandleProps;
   }
   ```

5. **useKeyboardShortcuts Hook**
   ```typescript
   // 키보드 단축키 관리
   interface UseKeyboardShortcutsReturn {
     registerShortcut: (key: string, handler: () => void) => void;
     unregisterShortcut: (key: string) => void;
   }
   ```

6. **useAIChat Hook (React Query 기반)**
   ```typescript
   // AI 채팅 기능 with SSE 지원
   interface UseAIChatReturn {
     sendMessage: (message: string) => void;
     messages: Message[];
     isLoading: boolean;
     error: Error | null;
     streamingMessage: string | null;
   }
   ```

#### Phase 3: Container 재구성 (3-4일)
1. **SelectionHandler Container**
   - 텍스트 선택 감지
   - FloatingUI 표시 여부 결정
   - 마우스 이벤트 처리

2. **PluginExecutor Container**
   - 플러그인 로드 및 관리
   - 실행 결과 처리
   - 에러 핸들링

3. **UIManager Container**
   - 전체 UI 상태 관리
   - ChatApp과 FloatingUI 간 전환
   - 키보드 단축키 처리

4. **SettingsManager Container**
   - API 엔드포인트 설정
   - 모델 선택 (OpenAI, Claude, 내부망 AI 등)
   - 테마 설정
   - 보안 설정

#### Phase 4: content.tsx 리팩토링 (2일)
```typescript
// 리팩토링 후 content.tsx (50줄 이하)
const ContentScript: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SelectionHandler>
          <UIManager />
        </SelectionHandler>
        <ChatButton />
      </Provider>
    </QueryClientProvider>
  );
};
```

#### Phase 5: 컴포넌트 세분화 (2일)
1. **FloatingUI 분리**
   - FloatingUIHeader
   - FloatingUIBody
   - FloatingUIActions
   - FloatingUIResult

2. **ChatApp 분리**
   - ChatHeader
   - ChatMessages
   - ChatInput
   - ChatActions

3. **SettingsModal 구현**
   - APISettings
   - ThemeSettings
   - SecuritySettings
   - PluginSettings

### 4. 추가 기능 구현

#### 1. SSE 기반 OpenAI 통합 (React Query)
```typescript
// hooks/useAIChat.ts
export const useAIChat = () => {
  const queryClient = useQueryClient();
  
  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const endpoint = await getApiEndpoint();
      const apiKey = await getApiKey();
      
      if (endpoint.includes('openai')) {
        return streamOpenAIResponse(message, apiKey);
      } else {
        return streamCustomResponse(message, endpoint, apiKey);
      }
    },
    onSuccess: (stream) => {
      // SSE 스트림 처리
    },
    onError: (error) => {
      // 에러 처리
    }
  });
  
  return { sendMessage, ... };
};
```

#### 2. API 엔드포인트 설정
```typescript
// containers/SettingsManager/ApiSettings.tsx
const ApiSettings: React.FC = () => {
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [modelType, setModelType] = useState<'openai' | 'claude' | 'custom'>('openai');
  
  return (
    <div>
      <Select value={modelType} onChange={setModelType}>
        <Option value="openai">OpenAI</Option>
        <Option value="claude">Claude</Option>
        <Option value="custom">내부망 AI</Option>
      </Select>
      
      <Input
        label="API Endpoint"
        value={endpoint}
        onChange={setEndpoint}
        placeholder={getPlaceholder(modelType)}
      />
      
      <Input
        label="API Key"
        type="password"
        value={apiKey}
        onChange={setApiKey}
      />
    </div>
  );
};
```

#### 3. 디자인 가독성 개선
```css
/* ChatApp.module.css 수정 */
.assistantBubble {
  /* 기존 스타일 제거하고 동적 스타일 적용 */
  background: var(--assistant-bubble-bg);
  color: var(--assistant-text-color);
  border: 1px solid var(--assistant-border-color);
  backdrop-filter: blur(10px);
  border-bottom-left-radius: 4px;
}

/* 배경색별 최적화된 색상 */
.container[data-background="white"] {
  --assistant-bubble-bg: rgba(30, 30, 30, 0.9);
  --assistant-text-color: rgba(255, 255, 255, 0.95);
  --assistant-border-color: rgba(30, 30, 30, 0.95);
  --timestamp-color: rgba(60, 60, 60, 0.8);
}

.container[data-background="light-green"] {
  --assistant-bubble-bg: rgba(20, 80, 20, 0.85);
  --assistant-text-color: rgba(255, 255, 255, 0.95);
  --assistant-border-color: rgba(20, 80, 20, 0.9);
  --timestamp-color: rgba(40, 100, 40, 0.9);
}

.container[data-background="light-pink"] {
  --assistant-bubble-bg: rgba(120, 20, 60, 0.85);
  --assistant-text-color: rgba(255, 255, 255, 0.95);
  --assistant-border-color: rgba(120, 20, 60, 0.9);
  --timestamp-color: rgba(140, 40, 80, 0.9);
}

/* 타임스탬프 가독성 개선 */
.timestamp {
  font-size: 12px;
  color: var(--timestamp-color);
  padding: 0 4px;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
```

### 5. 테스트 전략

#### 단위 테스트
- [ ] 각 hook에 대한 테스트 작성
- [ ] 컴포넌트 렌더링 테스트
- [ ] 플러그인 실행 로직 테스트
- [ ] SSE 스트림 처리 테스트

#### 통합 테스트
- [ ] 텍스트 선택 → FloatingUI 표시 플로우
- [ ] 플러그인 실행 → 결과 표시 플로우
- [ ] 키보드 단축키 동작
- [ ] API 엔드포인트 변경 → 채팅 동작

#### E2E 테스트
- [ ] 실제 웹페이지에서 전체 기능 테스트
- [ ] 다양한 텍스트 입력 필드 테스트
- [ ] 다양한 배경색에서 가독성 테스트

### 6. 성능 최적화

1. **메모이제이션 적용**
   - React.memo로 불필요한 리렌더링 방지
   - useMemo, useCallback 활용

2. **번들 크기 최적화**
   - 동적 import로 플러그인 lazy loading
   - 사용하지 않는 의존성 제거

3. **렌더링 최적화**
   - Virtual scrolling for chat messages
   - Debounce text selection events

4. **SSE 스트림 최적화**
   - 청크 단위 렌더링
   - 백프레셔 처리

### 7. 보안 강화

1. **입력 검증**
   - 모든 사용자 입력 sanitize
   - XSS 방지

2. **권한 관리**
   - 최소 권한 원칙 적용
   - manifest.json 권한 재검토

3. **API 키 보안**
   - Chrome storage API로 암호화 저장
   - 내부망 전용 인증 지원

### 8. 문서화

1. **컴포넌트 문서**
   - Storybook 도입 고려
   - Props 타입 명확히 정의

2. **API 문서**
   - Hook 사용법 문서화
   - 플러그인 개발 가이드

3. **설정 가이드**
   - API 엔드포인트 설정 방법
   - 내부망 AI 연동 가이드

## 📊 리팩토링 체크리스트

### 코드 품질
- [ ] 모든 함수가 20-30줄 이하인가?
- [ ] 함수가 단일 책임을 가지는가?
- [ ] 매개변수가 3개 이하인가?
- [ ] 중복 코드가 제거되었는가?
- [ ] 변수명이 명확한가?

### 구조
- [ ] components/hooks/containers 분리가 명확한가?
- [ ] 순환 참조가 없는가?
- [ ] 의존성 방향이 명확한가?
- [ ] 재사용 가능한 컴포넌트로 분리되었는가?

### 테스트
- [ ] 단위 테스트 커버리지 80% 이상인가?
- [ ] 통합 테스트가 주요 플로우를 커버하는가?
- [ ] E2E 테스트가 통과하는가?

### 성능
- [ ] 번들 크기가 적절한가?
- [ ] 불필요한 리렌더링이 없는가?
- [ ] 메모리 누수가 없는가?
- [ ] SSE 스트림이 효율적으로 처리되는가?

### 추가 기능
- [ ] React Query로 API 상태 관리가 되는가?
- [ ] API 엔드포인트 설정이 가능한가?
- [ ] 모든 배경색에서 가독성이 확보되는가?
- [ ] 내부망 AI 플랫폼 연동이 가능한가?

## 🚀 예상 결과

1. **유지보수성 향상**
   - 코드 가독성 200% 향상
   - 새 기능 추가 시간 50% 단축

2. **성능 개선**
   - 초기 로딩 시간 30% 감소
   - 메모리 사용량 20% 감소
   - SSE 스트림 처리 효율 향상

3. **개발 경험 개선**
   - 명확한 구조로 온보딩 시간 단축
   - 테스트 작성 용이

4. **사용자 경험 개선**
   - 모든 환경에서 가독성 확보
   - 다양한 AI 모델 지원
   - 내부망 환경 지원

## 📅 일정

- **총 소요 기간**: 3주 (15 영업일)
- **Phase 1**: 1-2일
- **Phase 2**: 2-3일
- **Phase 3**: 3-4일
- **Phase 4**: 2일
- **Phase 5**: 2일
- **추가 기능**: 3-4일
- **테스트 및 문서화**: 지속적

## 🎓 미분기하학적 해석

이 리팩토링은 코드베이스를 "평평한" 구조에서 "곡률을 가진" 구조로 변환하는 과정입니다:

- **Components**: 접평면(tangent plane) - UI의 국소적 표현
- **Hooks**: 벡터장(vector field) - 상태와 로직의 흐름
- **Containers**: 다양체(manifold) - 비즈니스 로직의 전체 구조

∇·Chat은 텍스트의 의미 공간에서 최적의 변환을 찾아주는 도구로, 코드 구조 자체도 이러한 수학적 우아함을 반영해야 합니다. 