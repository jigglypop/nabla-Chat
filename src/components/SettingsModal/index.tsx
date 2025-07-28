import React, { useState, useEffect, type FC } from 'react';
import styles from './SettingsModal.module.css';
import { useAtom } from 'jotai';
import { settingsAtom } from '../../atoms/chatAtoms';
import type { SettingsModalProps } from './types';
import contentStyles from "../../content.module.css"

export const SettingsModal: FC<SettingsModalProps> = () => {
  // const [modelType, setModelType] = useState('openai');
  // const [endpoint, setEndpoint] = useState('https://api.openai.com/v1/chat/completions')
  // const [apiKey, setApiKey] = useState('');
  // const [userProfile, setUserProfile] = useState('');
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [settings, setSettings] = useAtom(settingsAtom)

  const setUserProfile = (profile: string) => {
    const _settings = {
      ...settings,
    }
    _settings.userProfile = profile
    setSettings(() => ({
      ..._settings
    }))
    console.log(settings)
  }

  const setEndpoint = (endpoint: string) => {
    setSettings(state => ({
      ...state,
      endpoint,
    }))
  }
  
  const setApiKey = (apiKey: string) => {
    setSettings(state => ({
     ...state,
     apiKey,
    }))
  }
  useEffect(() => {
    // 저장된 설정 불러오기
    console.log(settings)
    // chrome.storage.sync.get(['settings'], (result) => {
    //   const parsedResult = JSON.parse('{"result":true, "count":42}')
    //   console.log('세팅', parsedResult, result)
    //   if (settings) {
    //     setSettings(() => ({
    //      modelType: result.modelType,
    //      endpoint: result.endpoint,
    //      userProfile: result.userProfile,
    //      apiKey: result.apiKey,
    //     }))
    //   }
    // });
  }, []);

  const handleSave = () => {
    setSettings(() => ({
      ...settings,
    }))
    // const settings = {
    //   modelType,
    //   endpoint: modelType === 'custom' ? endpoint : 
    //     modelType === 'openai' ? 'https://api.openai.com/v1/chat/completions' :
    //     'https://api.anthropic.com/v1/messages',
    //   apiKey
    // };
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
    setUserProfile("");
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
        {(profilePreview || settings.userProfile) && profilePreview && settings.userProfile ? (
         <img
          src={profilePreview || settings.userProfile}
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
        {(profilePreview || settings.userProfile) && (
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
     {settings.modelType === 'custom' && (
      <div className={styles.section}>
       <label className={styles.label}>
        <input
         type="text"
         value={settings.endpoint}
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
        value={settings.apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder={
         settings.modelType === 'openai'
          ? '...'
          : 'your-api-key'
        }
        className={styles.input}
       />
      </label>
     </div>
    </div>
    <div className={styles.modalFooter}>
     <button className={`${contentStyles.chatButton} ${contentStyles.box}`} onClick={handleSave}>
      저장
     </button>
    </div>
   </>
  )
};

export default SettingsModal;