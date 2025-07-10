import type { FeaturePlugin } from '../../types/features';
import { executePluginWithPrompt } from '../../services/openai';

export const translatePlugin: FeaturePlugin = {
  id: 'translate',
  name: '번역하기',
  icon: 'translate-icon-path',
  category: 'text',
  description: '선택한 텍스트를 다른 언어로 번역합니다.',
  defaultPrompt: '다음 텍스트를 영어로 번역해 주세요. 번역된 텍스트만 응답으로 제공해 주세요.',
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