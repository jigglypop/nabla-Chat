import React, { useState, useEffect, type FC } from 'react';
import styles from './SettingsModal.module.css';
import { useAtom } from 'jotai';
import { userProfileAtom } from '../../atoms/chatAtoms';
import type { SettingsModalProps } from './types';

export const SettingsModal: FC<SettingsModalProps> = () => {
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
  }, []);

  const handleSave = () => {
    const settings = {
      modelType,
      endpoint: modelType === 'custom' ? endpoint : 
        modelType === 'openai' ? 'https://api.openai.com/v1/chat/completions' :
        'https://api.anthropic.com/v1/messages',
      apiKey
    };
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


  return (
   <>
    <div className={styles.modalHeader}>
     <h2>설정</h2>
    </div>
    <div className={styles.modalBody}>
     <div className={styles.section}>
      <h3>프로필 설정</h3>
     </div>
     <div className={styles.section}>
      <div className={styles.profileSection}>
       <div className={styles.profilePreview}>
        {(profilePreview || userProfile) && profilePreview && userProfile ? (
         <img src={profilePreview || userProfile} alt="Profile" className={styles.profileImage} />
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
      <h3>AI 모델 API Endpoint 설정</h3>
     </div>
     {modelType === 'custom' && (
      <div className={styles.section}>
       <label className={styles.label}>
        <input
         type="text"
         value={endpoint}
         onChange={e => setEndpoint(e.target.value)}
         placeholder="https://[url 입력]"
         className={styles.input}
        />
       </label>
      </div>
     )}

     <div className={styles.section}>
      <label className={styles.label}>
       <input
        type="password"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder={
         modelType === 'openai' ? 'sk-...' : modelType === 'claude' ? 'sk-ant-...' : 'your-api-key'
        }
        className={styles.input}
       />
      </label>
     </div>
    </div>
   </>
  )
};

export default SettingsModal;