import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { sseClient } from '../../utils/sse'

export const explainPlugin: FeaturePlugin = {
  id: 'explain',
  name: '설명하기',
  category: 'text',
  icon: '💡',
  description: 'Get a detailed explanation of the selected text',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    try {
      const prompt = `Please provide a clear and detailed explanation of the following text or concept:\n\n${text}`
      
      const response = await sseClient.sendMessage(prompt, {
        systemPrompt: 'You are a knowledgeable teacher. Explain concepts clearly and simply, using examples when helpful. Break down complex ideas into understandable parts.'
      })
      
      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to explain text'
      }
    }
  }
} 