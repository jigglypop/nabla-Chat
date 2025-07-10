import React, { useState, useEffect } from 'react';
import type { FeaturePlugin } from '../types/features';
import './Popup.css';

function Popup() {
  const [plugins, setPlugins] = useState<FeaturePlugin[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_ALL_PLUGINS' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        setError('플러그인 목록을 불러오는 데 실패했습니다.');
      } else if (response) {
        setPlugins(response);
      }
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
        setError(`${pluginId} 플러그인 상태 변경에 실패했습니다.`);
        // Revert UI on failure
        setPlugins(prevPlugins => 
          prevPlugins.map(p => 
            p.id === pluginId ? { ...p, enabled: !p.enabled } : p
          )
        );
      }
    });
  };

  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Lovebug Settings</h1>
      </header>
      <main>
        {error && <p className="error-message">{error}</p>}
        <ul className="plugin-list">
          {plugins.length > 0 ? (
            plugins.map((plugin) => (
              <li key={plugin.id} className="plugin-item">
                <div className="plugin-info">
                  <span className="plugin-name">{plugin.name}</span>
                  <p className="plugin-description">{plugin.description}</p>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={plugin.enabled}
                    onChange={() => handleToggle(plugin.id)} 
                  />
                  <span className="slider round"></span>
                </label>
              </li>
            ))
          ) : (
            <p>플러그인을 불러오는 중입니다...</p>
          )}
        </ul>
      </main>
    </div>
  );
}

export default Popup; 