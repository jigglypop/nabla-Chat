import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { sseClient } from '../../utils/sse'

export const translatePlugin: FeaturePlugin = {
  id: 'translate',
  name: '번역하기',
  category: 'text',
  icon: '🌐',
  description: 'Translate the selected text',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    try {
      const prompt = `Please translate the following text to Korean (or to English if it's already in Korean):\n\n${text}`
      const response = await sseClient.sendMessage(prompt, {
        systemPrompt: 'You are a professional translator. Provide accurate and natural translations while preserving the original meaning and tone.'
      })
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to translate text'
      }
    }
  }
} 