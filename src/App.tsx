import { useState, useEffect, useRef } from "react";
import ChatApp from "./containers/ChatApp/ChatApp";
import styles from "./content.module.css";
import "./font.module.css";

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className={styles.testContainer}>
      <h1 className={styles.testTitle}>LOVEBUG</h1>
      {/* Extension Popup */}
      {/* 테스트 영역 */}
      <div className={styles.testContent}>
        <div className={styles.testSection}>
          <h2>채팅 기능 테스트</h2>
          <button onClick={() => setShowChat(true)}>채팅창 열기</button>
        </div>
      </div>
      
      {/* Chat App */}
      {showChat && (
        <ChatApp onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}

export default App;
