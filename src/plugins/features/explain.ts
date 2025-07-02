import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { sseClient } from '../../utils/sse'

export const explainPlugin: FeaturePlugin = {
  id: 'explain',
  name: 'Explain',
  category: 'text',
  icon: '💡',
  description: 'Explain complex text in simple terms',
  enabled: true,
  

  async execute(text: string): Promise<FeatureResult> {
    try {
      const prompt = `Explain the following text in simple, easy-to-understand terms. Break down complex concepts and provide examples if helpful:\n\n${text}`
      
      const response = await sseClient.sendMessage(prompt, {
        systemPrompt: 'You are an expert educator who excels at explaining complex topics in simple, accessible language. Use analogies and examples when appropriate.'
      })
      
      return {
        success: true,
        data: response,
        metadata: {
          complexityReduction: 'simplified'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to explain text'
      }
    }
  }
} 