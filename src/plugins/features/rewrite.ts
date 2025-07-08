import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { sseClient } from '../../utils/sse'

export const rewritePlugin: FeaturePlugin = {
  id: 'rewrite',
  name: '다시 쓰기',
  category: 'text',
  icon: '✏️',
  description: 'Rewrite the selected text to improve clarity and style',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    try {
      const prompt = `Please rewrite the following text to make it clearer, more concise, and better structured while maintaining the original meaning:\n\n${text}`
      
      const response = await sseClient.sendMessage(prompt, {
        systemPrompt: 'You are an expert writer and editor. Improve the text by enhancing clarity, fixing grammar, and improving style while preserving the original meaning.'
      })
      
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to rewrite text'
      }
    }
  }
} 