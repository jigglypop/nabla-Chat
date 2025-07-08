import ChatApp from "./components/ChatApp/ChatApp"
import FloatingUI from "./components/FloatingUI/FloatingUI"
import styles  from "./content.module.css"
import "./font.module.css"

function App() {
  return (
    <div className={styles.test}>
      <div className={styles.block}>
        <ChatApp onClose={()=>{}}/>
      </div>
      <div className={styles.block}>
        <FloatingUI selectedText={ "hello"} onClose={()=>{}}/>
      </div>
    </div>
  )
}

export default App
