import { atom } from 'jotai';

// 설정 atom (chrome.storage.sync로만 동기화)
export const settingsAtom = atom({
  modelType: 'openai',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: ''
}); 