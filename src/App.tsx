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
        <p className="dev-note">개발 모드: 텍스트를 선택하면 플로팅 UI가 나타납니다.</p>
      </header>
      <main className="App-main">
        <div className="test-section">
          <h2>테스트 텍스트</h2>
          <p className="test-text">
            이 텍스트를 드래그하여 선택하면 플로팅 UI가 나타납니다. 
            플로팅 UI에서는 요약, 번역, 설명, 다시쓰기 기능을 테스트할 수 있습니다.
          </p>
          <p className="test-text">
            ∇·Chat is an AI-powered Chrome extension that helps you process text with various AI features. 
            Select this text to see the floating UI in action.
          </p>
        </div>
        
        <div className="input-container">
          <label htmlFor="test-input">Input 테스트</label>
          <input
            id="test-input"
            type="text"
            placeholder="Select text here to see the AI assistant."
            defaultValue="This is some sample text in an input field. Try rewriting this."
          />
        </div>
        
        <div className="input-container">
          <label htmlFor="test-textarea">Textarea 테스트</label>
          <textarea
            id="test-textarea"
            rows={8}
            placeholder="Select text here to see the AI assistant."
            defaultValue="This is a sample paragraph inside a textarea. You can select this text to summarize, translate, or explain it using the floating ∇·Chat assistant. The goal is to make sure the extension can correctly identify selected text within form elements and provide contextual actions."
          />
        </div>

        <div className="info-section">
          <h3>사용 방법</h3>
          <ul>
            <li>텍스트를 드래그하여 선택하면 플로팅 UI가 나타납니다</li>
            <li>Ctrl 키를 누르면 플로팅 UI가 확장됩니다</li>
            <li>설정에서 비활성화한 플러그인은 플로팅 UI에 표시되지 않습니다</li>
            <li>각 플러그인의 프롬프트는 설정에서 커스터마이징할 수 있습니다</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
