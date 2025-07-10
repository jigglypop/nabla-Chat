import type { FeaturePlugin } from '../../types/features';
import { executePluginWithPrompt } from '../../services/openai';
import { getPromptForPlugin } from '../../utils/settings';

export const summarizePlugin: FeaturePlugin = {
  id: 'summarize',
  name: '요약하기',
  icon: 'summarize-icon-path',
  category: 'text',
  description: '선택한 텍스트를 간결하게 요약합니다.',
  defaultPrompt: '다음 텍스트를 핵심 내용만 간결하게 한국어로 요약해 주세요.',
  enabled: true,
  async execute(text: string) {
    const prompt = await getPromptForPlugin(this.id, this.defaultPrompt || '');
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