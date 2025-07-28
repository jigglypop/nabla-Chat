import { useEffect } from 'react';
import './App.css';

// 전역 플래그로 중복 실행 방지
declare global {
  interface Window {
    __nabla_content_loaded?: boolean;
  }
}

function App() {
  useEffect(() => {
    // 이미 로드되었으면 건너뛰기
    if (window.__nabla_content_loaded) {
      console.log('Content script already loaded, skipping');
      return;
    }

    // 개발 모드에서만 실행하고, 실제 익스텐션 환경이 아닐 때만 content script 로드
    if (process.env.NODE_ENV === 'development' && !window.chrome?.runtime) {
      window.__nabla_content_loaded = true;
      // content.tsx의 주요 로직을 여기서 실행
      import('./content').then(() => {
        console.log('Content script loaded in development mode');
      }).catch(err => {
        console.error('Failed to load content script:', err);
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>∇·Chat 플러그인 테스트</h1>
        <p className="dev-note">개발 모드: 우하단 채팅 버튼을 클릭하여 AI 채팅을 시작할 수 있습니다.</p>
      </header>
      <div className="info-section">
        <h3>사용 방법</h3>
        <ul>
          <li>우하단의 채팅 버튼을 클릭하면 AI 채팅 인터페이스가 열립니다</li>
          <li>채팅창은 드래그하여 이동하고 크기를 조절할 수 있습니다</li>
          <li>Ctrl+Shift+S 키로 채팅창을 토글할 수 있습니다</li>
          <li>설정에서 API 키와 배경 테마를 변경할 수 있습니다</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
