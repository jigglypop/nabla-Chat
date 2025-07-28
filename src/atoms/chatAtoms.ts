import { atom } from 'jotai';
import type { Message } from '../types/message';

// localStorage에서 저장된 위치 가져오기
const getSavedPosition = () => {
  try {
    const saved = localStorage.getItem('nabla-chat-position');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        x: Math.max(0, Math.min(window.innerWidth - 400, parsed.x || 20)),
        y: Math.max(0, Math.min(window.innerHeight - 600, parsed.y || 20))
      };
    }
  } catch (error) {
    console.warn('Failed to load saved position:', error);
  }
  return { 
    x: typeof window !== 'undefined' ? Math.max(0, window.innerWidth - 420) : 20, 
    y: 20 
  };
};

// localStorage에서 저장된 크기 가져오기
const getSavedSize = () => {
  try {
    const saved = localStorage.getItem('nabla-chat-size');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        width: Math.max(320, Math.min(window.innerWidth - 40, parsed.width || 400)),
        height: Math.max(400, Math.min(window.innerHeight - 40, parsed.height || 600))
      };
    }
  } catch (error) {
    console.warn('Failed to load saved size:', error);
  }
  return { width: 400, height: 600 };
};

export const messagesAtom = atom<Message[]>([
  {
    id: '1',
    role: 'assistant',
    content: '안녕하세요! ∇·Chat AI 어시스턴트입니다. 무엇을 도와드릴까요?',
    timestamp: new Date(),
  },
]);
export const inputAtom = atom<string>('');
export const isMinimizedAtom = atom<boolean>(false);
export const chatPositionAtom = atom(getSavedPosition());
export const chatSizeAtom = atom(getSavedSize());
// 연결 상태 atom - null은 체크 중
export const isConnectedAtom = atom<boolean | null>(null);
// 연결 체크 완료 여부
export const hasCheckedConnectionAtom = atom<boolean>(false);
// 설정 atom (chrome.storage.sync로만 동기화)
export const settingsAtom = atom({
  modelType: 'openai',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  apiKey: ''
});
// 채팅 열림 상태
export const chatOpenAtom = atom<boolean>(false); 