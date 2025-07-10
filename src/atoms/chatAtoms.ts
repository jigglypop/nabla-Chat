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
export const backgroundAtom = atomWithStorage<string>('chatBackground','glass1');

// 파생: 읽지 않은 메시지(assistant) 카운트
export const unreadCountAtom = atom((get) => {
  const msgs = get(messagesAtom);
  return msgs.filter((m) => m.role === 'assistant' && !m.read).length;
});
export const chatPositionAtom = atomWithStorage('chatPosition', { x: 20, y: 20 });
export const chatSizeAtom = atomWithStorage('chatSize', { width: 400, height: 600 });

// 연결 상태 atom - null은 체크 중
export const isConnectedAtom = atom<boolean | null>(null);
// 연결 체크 완료 여부
export const hasCheckedConnectionAtom = atom<boolean>(false);

// 사용자 프로필 atom
export const userProfileAtom = atomWithStorage<string | null>('userProfile', null);

// FloatingUI용 atom들
export const floatingPositionAtom = atom({ x: 0, y: 0 });
export const floatingBackgroundAtom = atom<string>('glass1');
export const chatOpenAtom = atom<boolean>(false);
export const isDraggingFloatingUIAtom = atom<boolean>(false); 