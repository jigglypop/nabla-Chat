import type { FeaturePlugin } from '../../types/features';
import { getOpenAIChatCompletion } from '../../services/openai';

export const summarizePlugin: FeaturePlugin = {
  id: 'summarize',
  name: '요약하기',
  category: 'text',
  icon: 'summarize',
  description: '긴 텍스트를 핵심 내용만 간결하게 요약합니다',
  enabled: true,
  defaultPrompt: '다음 텍스트를 핵심 내용만 간결하게 한국어로 요약해 주세요.\n\n[TEXT]:\n{text}',
  execute: async (text: string) => {
    try {
      const promptTemplate = summarizePlugin.customPrompt || summarizePlugin.defaultPrompt || '';
      const prompt = promptTemplate.replace('{text}', text);
      const result = await getOpenAIChatCompletion([
        { id: '1', role: 'user', content: prompt, timestamp: new Date() }
      ]);
      
      if (!result) {
        return { success: false, error: 'API로부터 응답을 받지 못했습니다.' };
      }
      
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return { success: false, error: errorMessage };
    }
  }
}; 