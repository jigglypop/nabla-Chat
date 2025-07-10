import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Lovebug Extension Test Page</h1>
        <p>Use the input fields below to test the floating UI.</p>
      </header>
      <main className="App-main">
        <div className="input-container">
          <label htmlFor="test-input">Test Input</label>
          <input
            id="test-input"
            type="text"
            placeholder="Select text here to see the AI assistant."
            defaultValue="This is some sample text in an input field. Try rewriting this."
          />
        </div>
        <div className="input-container">
          <label htmlFor="test-textarea">Test Textarea</label>
          <textarea
            id="test-textarea"
            rows={8}
            placeholder="Select text here to see the AI assistant."
            defaultValue="This is a sample paragraph inside a textarea. You can select this text to summarize, translate, or explain it using the floating lovebug assistant. The goal is to make sure the extension can correctly identify selected text within form elements and provide contextual actions."
          />
        </div>
      </main>
    </div>
  );
}

export default App;
