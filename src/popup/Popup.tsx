import { useState, useEffect } from 'react';
import type { FeaturePlugin } from '../types/features';
import styles from './Popup.module.css';

function Popup() {
  const [plugins, setPlugins] = useState<FeaturePlugin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPlugin, setExpandedPlugin] = useState<string | null>(null);
  const [promptChanges, setPromptChanges] = useState<Record<string, string>>({});

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_ALL_PLUGINS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        setError('플러그인 목록을 불러오는 데 실패했습니다.');
      } else if (response) {
        setPlugins(response);
        const initialPrompts: Record<string, string> = {};
        response.forEach((plugin: FeaturePlugin) => {
          initialPrompts[plugin.id] = plugin.customPrompt || plugin.defaultPrompt || '';
        });
        setPromptChanges(initialPrompts);
      }
      setLoading(false);
    });
  }, []);

  const handleToggle = (pluginId: string) => {
    setPlugins(prevPlugins =>
      prevPlugins.map(p =>
        p.id === pluginId ? { ...p, enabled: !p.enabled } : p
      )
    );
    chrome.runtime.sendMessage({ type: 'TOGGLE_PLUGIN', pluginId: pluginId }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        console.error(chrome.runtime.lastError || 'Failed to toggle plugin');
        setError(`플러그인 상태 변경에 실패했습니다.`);
        setPlugins(prevPlugins =>
          prevPlugins.map(p =>
            p.id === pluginId ? { ...p, enabled: !p.enabled } : p
          )
        );
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  const handlePromptChange = (pluginId: string, newPrompt: string) => {
    setPromptChanges(prev => ({ ...prev, [pluginId]: newPrompt }));
  };

  const savePrompt = (pluginId: string) => {
    const newPrompt = promptChanges[pluginId];
    chrome.runtime.sendMessage({
      type: 'UPDATE_PLUGIN_PROMPT',
      pluginId: pluginId,
      prompt: newPrompt
    }, (response) => {
      if (chrome.runtime.lastError || !response?.success) {
        setError('프롬프트 저장에 실패했습니다.');
        setTimeout(() => setError(null), 3000);
      } else {
        setPlugins(prevPlugins =>
          prevPlugins.map(p =>
            p.id === pluginId ? { ...p, customPrompt: newPrompt } : p
          )
        );
        setExpandedPlugin(null);
      }
    });
  };

  const resetPrompt = (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (plugin) {
      setPromptChanges(prev => ({ ...prev, [pluginId]: plugin.defaultPrompt || '' }));
    }
  };

  const toggleExpanded = (pluginId: string) => {
    setExpandedPlugin(expandedPlugin === pluginId ? null : pluginId);
  };

  const getPluginIcon = (pluginId: string) => {
    switch (pluginId) {
      case 'summarize':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z"/></svg>;
      case 'translate':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>;
      case 'explain':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>;
      case 'rewrite':
        return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>;
      default:
        return null;
    }
  };

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
      
      <section className={styles.settingsSection}>
        <h2>플러그인 설정</h2>
        <p className={styles.sectionDescription}>사용할 AI 기능을 선택하세요</p>
      </section>

      <main className={styles.popupMain}>
        {error && (
          <div className={styles.errorBanner}>
            <span>{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>플러그인을 불러오는 중...</p>
          </div>
        ) : (
          <ul className={styles.pluginList}>
            {plugins.map((plugin) => (
              <li key={plugin.id} className={`${styles.pluginItem} ${expandedPlugin === plugin.id ? styles.expanded : ''}`}>
                <div className={styles.pluginMain}>
                  <div className={styles.pluginIcon}>
                    {getPluginIcon(plugin.id)}
                  </div>
                  <div className={styles.pluginInfo}>
                    <span className={styles.pluginName}>{plugin.name}</span>
                    <p className={styles.pluginDescription}>{plugin.description}</p>
                  </div>
                  <button 
                    className={styles.settingsBtn} 
                    onClick={() => toggleExpanded(plugin.id)}
                    title="프롬프트 설정"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 15.516c1.922 0 3.516-1.594 3.516-3.516S13.922 8.484 12 8.484 8.484 10.078 8.484 12s1.594 3.516 3.516 3.516zm7.453-2.532l2.109 1.641c.188.141.234.422.094.656l-2.016 3.469c-.141.234-.375.281-.609.188l-2.484-1.031c-.516.375-1.078.703-1.688.891l-.375 2.672c-.047.234-.234.422-.469.422h-4.031c-.234 0-.422-.188-.469-.422l-.375-2.672c-.609-.188-1.172-.516-1.688-.891l-2.484 1.031c-.234.094-.469.047-.609-.188L2.343 15.281c-.141-.234-.094-.516.094-.656l2.109-1.641c-.047-.328-.094-.656-.094-.984s.047-.656.094-.984L2.437 9.375c-.188-.141-.234-.422-.094-.656l2.016-3.469c.141-.234.375-.281.609-.188l2.484 1.031c.516-.375 1.078-.703 1.688-.891l.375-2.672C9.562 2.297 9.75 2.109 9.984 2.109h4.031c.234 0 .422.188.469.422l.375 2.672c.609.188 1.172.516 1.688.891l2.484-1.031c.234-.094.469-.047.609-.188l2.016 3.469c.141.234.094.516-.094.656l-2.109 1.641c.047.328.094.656.094.984s-.047.656-.094.984z"/>
                    </svg>
                  </button>
                  <label className={styles.switch}>
                    <input 
                      type="checkbox" 
                      checked={plugin.enabled}
                      onChange={() => handleToggle(plugin.id)} 
                    />
                    <span className={`${styles.slider} ${styles.round}`}></span>
                  </label>
                </div>
                {expandedPlugin === plugin.id && (
                  <div className={styles.pluginSettings}>
                    <div className={styles.promptSection}>
                      <label className={styles.promptLabel}>프롬프트 설정</label>
                      <p className={styles.promptHelp}>
                        {'{text}'} 부분이 선택된 텍스트로 치환됩니다.
                      </p>
                      <textarea
                        className={styles.promptInput}
                        value={promptChanges[plugin.id]}
                        onChange={(e) => handlePromptChange(plugin.id, e.target.value)}
                        rows={4}
                        placeholder="프롬프트를 입력하세요..."
                      />
                      <div className={styles.promptActions}>
                        <button 
                          className={`${styles.btn} ${styles.btnSecondary}`}
                          onClick={() => resetPrompt(plugin.id)}
                        >
                          기본값으로 재설정
                        </button>
                        <button 
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => savePrompt(plugin.id)}
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className={styles.popupFooter}>
        <a href="#" className={styles.footerLink}>도움말</a>
        <span className={styles.separator}>•</span>
        <a href="https://github.com/nabla-chat/nabla-chat" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>GitHub</a>
      </footer>
    </div>
  );
}

export default Popup; 