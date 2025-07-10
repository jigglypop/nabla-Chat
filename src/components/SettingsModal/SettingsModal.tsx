import React, { useState, useEffect } from 'react';
import styles from './SettingsModal.module.css';
import { useAtom } from 'jotai';
import { userProfileAtom } from '../../atoms/chatAtoms';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [modelType, setModelType] = useState<'openai' | 'claude' | 'custom'>('openai');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  useEffect(() => {
    // 저장된 설정 불러오기
    chrome.storage.sync.get(['apiSettings'], (result) => {
      if (result.apiSettings) {
        setModelType(result.apiSettings.modelType || 'openai');
        setEndpoint(result.apiSettings.endpoint || '');
        setApiKey(result.apiSettings.apiKey || '');
      }
    });
  }, [isOpen]);

  const handleSave = () => {
    const settings = {
      modelType,
      endpoint: modelType === 'custom' ? endpoint : 
        modelType === 'openai' ? 'https://api.openai.com/v1/chat/completions' :
        'https://api.anthropic.com/v1/messages',
      apiKey
    };

    chrome.storage.sync.set({ apiSettings: settings }, () => {
      onClose();
    });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfilePreview(base64String);
        setUserProfile(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfile = () => {
    setProfilePreview(null);
    setUserProfile(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>설정</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.section}>
            <h3>프로필 설정</h3>
            <div className={styles.profileSection}>
              <div className={styles.profilePreview}>
                {(profilePreview || userProfile) ? (
                  <img 
                    src={profilePreview || userProfile} 
                    alt="Profile" 
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.profilePlaceholder}>
                    <span>👤</span>
                  </div>
                )}
              </div>
              <div className={styles.profileActions}>
                <input
                  type="file"
                  id="profileInput"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className={styles.fileInput}
                />
                <label htmlFor="profileInput" className={styles.uploadButton}>
                  프로필 이미지 선택
                </label>
                {(profilePreview || userProfile) && (
                  <button onClick={handleRemoveProfile} className={styles.removeButton}>
                    이미지 제거
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>AI 모델 설정</h3>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="modelType"
                  value="openai"
                  checked={modelType === 'openai'}
                  onChange={(e) => setModelType(e.target.value as 'openai')}
                />
                <span>OpenAI (GPT)</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="modelType"
                  value="claude"
                  checked={modelType === 'claude'}
                  onChange={(e) => setModelType(e.target.value as 'claude')}
                />
                <span>Claude (Anthropic)</span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="modelType"
                  value="custom"
                  checked={modelType === 'custom'}
                  onChange={(e) => setModelType(e.target.value as 'custom')}
                />
                <span>Custom (내부 AI)</span>
              </label>
            </div>
          </div>

          {modelType === 'custom' && (
            <div className={styles.section}>
              <label className={styles.label}>
                <span>API Endpoint</span>
                <input
                  type="text"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  placeholder="https://your-api-endpoint.com/v1/chat"
                  className={styles.input}
                />
              </label>
            </div>
          )}

          <div className={styles.section}>
            <label className={styles.label}>
              <span>API Key</span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={modelType === 'openai' ? 'sk-...' : modelType === 'claude' ? 'sk-ant-...' : 'your-api-key'}
                className={styles.input}
              />
            </label>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.saveButton} onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}; 