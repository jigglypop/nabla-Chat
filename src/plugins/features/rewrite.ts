import type { FeaturePlugin } from '../../types/features';
import { getOpenAIChatCompletion } from '../../services/openai';

export const rewritePlugin: FeaturePlugin = {
  id: 'rewrite',
  name: '다시쓰기',
  category: 'text',
  icon: 'rewrite',
  description: '텍스트를 더 명확하고 읽기 쉽게 다시 작성합니다',
  enabled: true,
  defaultPrompt: '다음 텍스트를 더 명확하고 자연스러운 표현으로 다시 작성해 주세요. 원본의 의미는 유지해야 합니다.\n\n[TEXT]:\n{text}',
  execute: async (text: string) => {
    try {
      const promptTemplate = rewritePlugin.customPrompt || rewritePlugin.defaultPrompt || '';
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