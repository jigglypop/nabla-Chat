import OpenAI from 'openai';
import type { Message } from '../containers/ChatApp/types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const getOpenAIChatCompletion = async (messages: Message[]) => {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    console.error('OpenAI API key is not set.');
    return 'OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.';
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages.map(({ id, timestamp, ...rest }) => rest),
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting OpenAI chat completion:', error);
    return 'AI 응답을 가져오는 중 오류가 발생했습니다.';
  }
};

export const executePluginWithPrompt = async (prompt: string, text: string) => {
  const fullPrompt = `${prompt}\n\n[TEXT]:\n${text}`;
  
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: fullPrompt },
      ],
    });
    return chatCompletion.choices[0].message.content;
  } catch (error) {
    console.error('Error executing plugin with prompt:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}; 