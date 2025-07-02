import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { sseClient } from '../../utils/sse'

export const translatePlugin: FeaturePlugin = {
  id: 'translate',
  name: 'Translate',
  category: 'text',
  icon: '🌐',
  description: 'Translate text to another language',
  enabled: true,
  
  async execute(text: string, options = { language: 'Korean' }): Promise<FeatureResult> {
    try {
      const targetLanguage = options.language || 'Korean'
      const prompt = `Translate the following text to ${targetLanguage}. Maintain the original tone and style:\n\n${text}`
      
      const response = await sseClient.sendMessage(prompt, {
        systemPrompt: 'You are a professional translator. Provide accurate and natural translations while preserving the original meaning and tone.'
      })
      
      return {
        success: true,
        data: response,
        metadata: {
          sourceLang: 'auto-detected',
          targetLang: targetLanguage
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to translate text'
      }
    }
  }
} 