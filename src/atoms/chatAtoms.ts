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

export const chatPositionAtom = atomWithStorage<{ x: number; y: number }>(
  'lovebug-chat-position',
  {
    x: window.innerWidth - 420,
    y: 20,
  }
);

export const chatSizeAtom = atomWithStorage<{ width: number; height: number }>(
  'lovebug-chat-size',
  {
    width: 400,
    height: 600,
  }
);

export const backgroundAtom = atom<string>('gradient1'); 

// FloatingUI용 atom들
export const floatingPositionAtom = atomWithStorage<{ x: number; y: number }>(
  'lovebug-floating-position',
  {
    x: 100,
    y: 100,
  }
);

export const floatingBackgroundAtom = atomWithStorage<string>('lovebug-floating-background', 'gradient6'); 