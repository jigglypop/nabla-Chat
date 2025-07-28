import { type FC } from 'react';
import styles from './SettingsModal.module.css';
import { useSettings } from '../../hooks/useSettings';
import type { SettingsModalProps } from './types';
import contentStyles from "../../content.module.css";

export const SettingsModal: FC<SettingsModalProps> = () => {
  const { settings, saveSettings } = useSettings();
  
  const handleSettingChange = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
    saveSettings({ [key]: value });
  };

  return (
   <>
    <div className={styles.modalHeader}>
     <h2>설정</h2>
    </div>
    <div className={styles.modalBody}>
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
  );
};

export default SettingsModal;