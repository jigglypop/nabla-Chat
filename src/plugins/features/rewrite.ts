import type { FeaturePlugin } from '../../types/features';
import { executePluginWithPrompt } from '../../services/openai';

export const rewritePlugin: FeaturePlugin = {
  id: 'rewrite',
  name: '다시 쓰기',
  icon: 'rewrite-icon-path',
  category: 'text',
  description: '선택한 텍스트를 더 나은 표현으로 다시 작성합니다.',
  defaultPrompt: '다음 텍스트를 더 명확하고 자연스러운 표현으로 다시 작성해 주세요. 원본의 의미는 유지해야 합니다.',
  enabled: true,
  async execute(text: string) {
    const prompt = this.defaultPrompt || '';
    try {
      const result = await executePluginWithPrompt(prompt, text);
      if (!result) {
        throw new Error('API로부터 응답을 받지 못했습니다.');
      }
      return { success: true, data: result };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      return { success: false, error: errorMessage };
    }
  },
}; 