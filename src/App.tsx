import { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    // 개발 모드에서 content script 시뮬레이션
    if (process.env.NODE_ENV === 'development') {
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
      <main className="App-main">
        <div className="test-section">
          <h2>테스트 영역</h2>
          <p className="test-text">
            이 페이지는 ∇·Chat Chrome 확장 프로그램의 개발 모드입니다. 
            우하단의 채팅 버튼을 클릭하여 AI 어시스턴트와 대화할 수 있습니다.
          </p>
          <p className="test-text">
            ∇·Chat is an AI-powered Chrome extension for chatting with AI assistants. 
            Click the chat button in the bottom right corner to start a conversation.
          </p>
        </div>
        
        <div className="input-container">
          <label htmlFor="test-input">Input 테스트</label>
          <input
            id="test-input"
            type="text"
            placeholder="Chat button will appear in the bottom right corner."
            defaultValue="You can start chatting with AI by clicking the chat button."
          />
        </div>
        
        <div className="input-container">
          <label htmlFor="test-textarea">Textarea 테스트</label>
          <textarea
            id="test-textarea"
            rows={8}
            placeholder="Chat button will appear in the bottom right corner."
            defaultValue="This is a sample text area. The ∇·Chat extension provides an AI chat interface that you can access via the floating chat button. You can discuss any topic with the AI assistant."
          />
        </div>

        <div className="info-section">
          <h3>사용 방법</h3>
          <ul>
            <li>우하단의 채팅 버튼을 클릭하면 AI 채팅 인터페이스가 열립니다</li>
            <li>채팅창은 드래그하여 이동하고 크기를 조절할 수 있습니다</li>
            <li>Ctrl+Shift+S 키로 채팅창을 토글할 수 있습니다</li>
            <li>설정에서 API 키와 배경 테마를 변경할 수 있습니다</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
