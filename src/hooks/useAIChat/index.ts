import { useMutation, useQueryClient } from '@tanstack/react-query';
import { streamOpenAIChatCompletion, checkAPIConnection } from '../../services/openai';
import type { Message } from '../../containers/ChatApp/types';
import { messagesAtom, isConnectedAtom, hasCheckedConnectionAtom } from '../../atoms/chatAtoms';
import { useAtom } from 'jotai';
import { useEffect } from 'react';

export const useAIChat = () => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useAtom(messagesAtom);
  const [isConnected, setIsConnected] = useAtom(isConnectedAtom);
  const [hasCheckedConnection, setHasCheckedConnection] = useAtom(hasCheckedConnectionAtom);
  
  // 연결 상태 확인
  useEffect(() => {
    // 이미 체크했으면 다시 체크하지 않음
    if (hasCheckedConnection) return;
    
    const checkConnection = async () => {
      try {
        // chrome.storage가 없는 경우 (개발 환경 등)
        if (!chrome?.storage?.sync) {
          setIsConnected(false);
          setHasCheckedConnection(true);
          return;
        }
        
        // 실제 API 연결 테스트
        const isConnected = await checkAPIConnection();
        setIsConnected(isConnected);
        setHasCheckedConnection(true);
      } catch (error) {
        console.error('Connection check error:', error);
        setIsConnected(false);
        setHasCheckedConnection(true);
      }
    };
    
    // 약간의 지연을 두고 체크 (UI가 렌더링된 후)
    const timer = setTimeout(checkConnection, 100);
    
    return () => clearTimeout(timer);
  }, [hasCheckedConnection, setIsConnected, setHasCheckedConnection]);
  
  // storage 변경 감지 및 재연결 테스트
  useEffect(() => {
    const handleStorageChange = async (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.apiSettings) {
        // API 설정이 변경되면 연결 상태를 다시 확인
        setIsConnected(null); // 확인 중 상태로 변경
        const isConnected = await checkAPIConnection();
        setIsConnected(isConnected);
      }
    };
    
    if (chrome?.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, [setIsConnected]);
  
  // 주기적인 연결 상태 확인 (30초마다)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (hasCheckedConnection) {
        const isConnected = await checkAPIConnection();
        setIsConnected(isConnected);
      }
    }, 30000); // 30초
    
    return () => clearInterval(interval);
  }, [hasCheckedConnection, setIsConnected]);
  
  const mutation = useMutation({
    mutationFn: (newMessages: Message[]) => {
      const streamingMessageId = (Date.now() + 1).toString();
      let messageAdded = false;
      
      return new Promise<void>((resolve, reject) => {
        streamOpenAIChatCompletion(
          newMessages,
          (chunk) => {
            // 첫 번째 청크를 받을 때만 메시지 추가
            if (!messageAdded) {
              setMessages(prev => [...prev, {
                id: streamingMessageId,
                role: 'assistant',
                content: chunk,
                timestamp: new Date()
              }]);
              messageAdded = true;
              setIsConnected(true); // 스트리밍 시작 시 연결됨으로 표시
            } else {
              // 이후 청크는 기존 메시지에 추가
              setMessages(prev => prev.map(m => 
                m.id === streamingMessageId ? { ...m, content: m.content + chunk } : m
              ));
            }
          },
          () => {
            // 스트리밍 완료
            resolve();
          },
          (error) => {
            // 스트리밍 중 에러 발생
            if (!messageAdded) {
              // 에러 발생 시에도 메시지는 추가해야 함
              setMessages(prev => [...prev, {
                id: streamingMessageId,
                role: 'assistant',
                content: `Error: ${error.message}`,
                timestamp: new Date()
              }]);
            } else {
              setMessages(prev => prev.map(m => 
                m.id === streamingMessageId ? { ...m, content: `Error: ${error.message}` } : m
              ));
            }
            setIsConnected(false); // 에러 시 연결 상태 업데이트
            reject(error);
          }
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      console.error("AI Chat Error:", error);
      setIsConnected(false);
    }
  });

  const sendMessage = (input: string) => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    mutation.mutate(newMessages);
  };
  
  return {
    sendMessage,
    isLoading: mutation.isPending,
    isConnected: isConnected as boolean | null,
  };
}; 