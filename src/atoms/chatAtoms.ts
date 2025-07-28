import { atom } from 'jotai';
import type { Message } from '../types/message';

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
export const chatPositionAtom = atom({ x: 20, y: 20 });
export const chatSizeAtom = atom({ width: 400, height: 600 });
// 연결 상태 atom - null은 체크 중
export const isConnectedAtom = atom<boolean | null>(null);
// 연결 체크 완료 여부
export const hasCheckedConnectionAtom = atom<boolean>(false);
// 사용자 프로필 atom
// localStorage 대신 직접 상태 관리 (chrome.storage.sync로만 동기화)
export const settingsAtom = atom({
  modelType: 'openai',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  userProfile: "",
  apiKey: ''
});
// 채팅 열림 상태
export const chatOpenAtom = atom<boolean>(false); 