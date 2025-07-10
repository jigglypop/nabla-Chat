import type { FeaturePlugin } from '../../types/features';
import { getOpenAIChatCompletion } from '../../services/openai';

export const translatePlugin: FeaturePlugin = {
  id: 'translate',
  name: '번역하기',
  category: 'text',
  icon: 'translate',
  description: '텍스트를 다른 언어로 번역합니다',
  enabled: true,
  defaultPrompt: '다음 텍스트를 영어로 번역해 주세요. 번역된 텍스트만 응답으로 제공해 주세요.\n\n[TEXT]:\n{text}',
  execute: async (text: string) => {
    try {
      const promptTemplate = translatePlugin.customPrompt || translatePlugin.defaultPrompt || '';
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