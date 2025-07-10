import type { Message } from '../containers/ChatApp/types';

interface APISettings {
  modelType: 'openai' | 'claude' | 'custom';
  endpoint: string;
  apiKey: string;
}

// API 설정 가져오기
const getAPISettings = async (): Promise<APISettings> => {
  const result = await chrome.storage.sync.get(['apiSettings']);
  if (!result.apiSettings) {
    // 기본값 반환 (환경변수 사용)
    return {
      modelType: 'openai',
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || ''
    };
  }
  return result.apiSettings;
};

// API 연결 상태 확인 함수
export const checkAPIConnection = async (): Promise<boolean> => {
  try {
    const settings = await getAPISettings();
    
    if (!settings.apiKey) {
      return false;
    }

    // 간단한 테스트 요청 (최소한의 토큰 사용)
    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelType === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-opus',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1,
        stream: false
      })
    });

    // 401은 인증 실패, 다른 에러는 연결은 되지만 다른 문제
    return response.ok || (response.status !== 401 && response.status !== 403);
  } catch (error) {
    // 네트워크 에러 등
    console.error('Connection check failed:', error);
    return false;
  }
};

export const getOpenAIChatCompletion = async (messages: Message[]) => {
  try {
    const settings = await getAPISettings();
    
    if (!settings.apiKey) {
      return 'API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.';
    }

    // OpenAI 형식으로 메시지 변환
    const formattedMessages = messages.map(({ id, timestamp, ...rest }) => rest);

    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelType === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-opus',
        messages: formattedMessages,
        stream: false // 일단 스트리밍 비활성화
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 요청 실패: ${response.statusText}`);
    }

    const data = await response.json();
    
    // OpenAI와 Claude의 응답 형식 처리
    if (settings.modelType === 'openai' || settings.modelType === 'custom') {
      return data.choices?.[0]?.message?.content || '응답을 받지 못했습니다.';
    } else if (settings.modelType === 'claude') {
      return data.content?.[0]?.text || '응답을 받지 못했습니다.';
    }
    
    return '응답을 받지 못했습니다.';
  } catch (error) {
    console.error('Error getting AI chat completion:', error);
    return error instanceof Error ? 
      `AI 응답 중 오류가 발생했습니다: ${error.message}` : 
      'AI 응답을 가져오는 중 오류가 발생했습니다.';
  }
};

// SSE 스트리밍 지원 함수 (추후 React Query와 함께 사용)
export const streamOpenAIChatCompletion = async (
  messages: Message[], 
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) => {
  try {
    const settings = await getAPISettings();
    
    if (!settings.apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    const formattedMessages = messages.map(({ id, timestamp, ...rest }) => rest);

    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelType === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-opus',
        messages: formattedMessages,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 요청 실패: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('스트림을 읽을 수 없습니다.');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }
    
    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'));
  }
};

export const executePluginWithPrompt = async (prompt: string, text: string) => {
  const settings = await getAPISettings();
  const fullPrompt = `${prompt}\n\n[TEXT]:\n${text}`;
  
  try {
    const response = await fetch(settings.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.modelType === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-opus',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: fullPrompt }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 요청 실패: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (settings.modelType === 'openai' || settings.modelType === 'custom') {
      return data.choices?.[0]?.message?.content || '응답을 받지 못했습니다.';
    } else if (settings.modelType === 'claude') {
      return data.content?.[0]?.text || '응답을 받지 못했습니다.';
    }
    
    return '응답을 받지 못했습니다.';
  } catch (error) {
    console.error('Error executing plugin with prompt:', error);
    throw error;
  }
}; 