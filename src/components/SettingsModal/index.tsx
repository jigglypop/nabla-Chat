import React, { type FC } from 'react';
import styles from './SettingsModal.module.css';
import { useSettings } from '../../hooks/useSettings';
import type { SettingsModalProps } from './types';
import contentStyles from "../../content.module.css";

export const SettingsModal: FC<SettingsModalProps> = () => {
  const { settings, saveSettings } = useSettings();
  
  const handleSettingChange = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    saveSettings({ [key]: value });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleSettingChange('userProfile', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfile = () => {
    handleSettingChange('userProfile', "");
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
        {settings.userProfile ? (
         <img
          src={settings.userProfile}
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
        {settings.userProfile && (
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
         onChange={e => handleSettingChange('endpoint', e.target.value)}
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
        onChange={e => handleSettingChange('apiKey', e.target.value)}
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
     <button className={`${contentStyles.chatButton} ${contentStyles.box}`}>
      저장
     </button>
    </div>
   </>
  )
};

export default SettingsModal;