import React, { useState, useEffect } from 'react';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModelType = 'openai' | 'claude' | 'custom';

interface APISettings {
  modelType: ModelType;
  endpoint: string;
  apiKey: string;
}

const DEFAULT_ENDPOINTS = {
  openai: 'https://api.openai.com/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
  custom: ''
};

export const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [settings, setSettings] = useState<APISettings>({
    modelType: 'openai',
    endpoint: DEFAULT_ENDPOINTS.openai,
    apiKey: ''
  });

  useEffect(() => {
    // 저장된 설정 불러오기
    chrome.storage.sync.get(['apiSettings'], (result) => {
      if (result.apiSettings) {
        setSettings(result.apiSettings);
      }
    });
  }, []);

  const handleModelTypeChange = (modelType: ModelType) => {
    setSettings({
      ...settings,
      modelType,
      endpoint: DEFAULT_ENDPOINTS[modelType] || settings.endpoint
    });
  };

  const handleSave = async () => {
    await chrome.storage.sync.set({ apiSettings: settings });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>API 설정</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>AI 모델 선택</label>
            <select 
              className={styles.select}
              value={settings.modelType}
              onChange={(e) => handleModelTypeChange(e.target.value as ModelType)}
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
              <option value="custom">내부망 AI</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>API Endpoint</label>
            <input
              className={styles.input}
              type="text"
              value={settings.endpoint}
              onChange={(e) => setSettings({ ...settings, endpoint: e.target.value })}
              placeholder="API 엔드포인트 URL을 입력하세요"
            />
            <small className={styles.hint}>
              {settings.modelType === 'custom' && '내부망 AI 플랫폼의 URL을 입력하세요'}
            </small>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>API Key</label>
            <input
              className={styles.input}
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="API 키를 입력하세요"
            />
            <small className={styles.hint}>
              API 키는 안전하게 암호화되어 저장됩니다
            </small>
          </div>

          <div className={styles.infoBox}>
            <p><strong>현재 연결:</strong> {settings.modelType === 'openai' ? 'OpenAI GPT' : settings.modelType === 'claude' ? 'Claude AI' : '내부망 AI'}</p>
            <p><strong>엔드포인트:</strong> {settings.endpoint}</p>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>취소</button>
          <button className={styles.saveButton} onClick={handleSave}>저장</button>
        </div>
      </div>
    </div>
  );
}; 