import type { FeaturePlugin } from '../../types/features';
import { executePluginWithPrompt } from '../../services/openai';

export const explainPlugin: FeaturePlugin = {
  id: 'explain',
  name: '설명하기',
  icon: 'explain-icon-path',
  category: 'text',
  description: '선택한 텍스트의 의미나 개념을 자세히 설명합니다.',
  defaultPrompt: '다음 텍스트나 개념에 대해 한국어로 자세히 설명해 주세요. 일반인이 이해하기 쉽게 예시를 들어주면 좋습니다.',
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