import { useMutation, useQueryClient } from '@tanstack/react-query';
import { streamOpenAIChatCompletion } from '../../services/openai';
import type { Message } from '../../containers/ChatApp/types';
import { messagesAtom } from '../../atoms/chatAtoms';
import { useAtom } from 'jotai';

export const useAIChat = () => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useAtom(messagesAtom);
  
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
  };
}; 