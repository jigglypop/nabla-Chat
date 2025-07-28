import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Message } from '../containers/ChatApp/types';

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
export const chatPositionAtom = atomWithStorage('chatPosition', { x: 20, y: 20 });
export const chatSizeAtom = atomWithStorage('chatSize', { width: 400, height: 600 });
// 연결 상태 atom - null은 체크 중
export const isConnectedAtom = atom<boolean | null>(null);
// 연결 체크 완료 여부
export const hasCheckedConnectionAtom = atom<boolean>(false);
// 사용자 프로필 atom
export const userProfileAtom = atomWithStorage<string | null>('userProfile', null);
export const settingsAtom = atomWithStorage('settings', {
  modelType: 'openai',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  userProfile: "",
  apiKey: ''
});
// 채팅 열림 상태
export const chatOpenAtom = atom<boolean>(false); 