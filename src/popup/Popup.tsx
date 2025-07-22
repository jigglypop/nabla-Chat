import React from 'react';
import { useAtom } from 'jotai';
import { backgroundAtom } from '../atoms/chatAtoms';
import { BackgroundSelector } from '../components/BGSelector';
import styles from './Popup.module.css';

function Popup() {
  const [background, setBackground] = useAtom(backgroundAtom);

  return (
    <div className={styles.popupContainer}>
      <header className={styles.popupHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <svg width="36" height="36" viewBox="0 0 128 128">
                <rect width="128" height="128" fill="url(#nabla-gradient)" rx="24"/>
                <defs>
                  <linearGradient id="nabla-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#12c2e9" />
                    <stop offset="50%" stopColor="#c471ed" />
                    <stop offset="100%" stopColor="#f64f59" />
                  </linearGradient>
                </defs>
                <text x="64" y="80" textAnchor="middle" fill="white" fontSize="60" fontFamily="Arial, sans-serif" fontWeight="bold">∇</text>
              </svg>
            </div>
            <div className={styles.titleSection}>
              <h1>∇·Chat</h1>
              <span className={styles.version}>v0.1.0</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className={styles.popupMain}>
        <section className={styles.settingsSection}>
          <h2>테마 설정</h2>
          <p className={styles.sectionDescription}>채팅창의 테마를 선택하세요.</p>
          <div className={styles.selectorWrapper}>
            <BackgroundSelector background={background} setBackground={setBackground} />
          </div>
        </section>
      </main>

      <footer className={styles.popupFooter}>
        <a href="https://github.com/nabla-chat/nabla-chat" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>GitHub</a>
      </footer>
    </div>
  );
}

export default Popup;