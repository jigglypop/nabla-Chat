import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { sseClient } from '../../utils/sse'

export const summarizePlugin: FeaturePlugin = {
  id: 'summarize',
  name: 'Summarize',
  category: 'text',
  icon: '📝',
  description: 'Generate a concise summary of the selected text',
  enabled: true,
  
  async execute(text: string): Promise<FeatureResult> {
    try {
      const prompt = `Please provide a concise summary of the following text:\n\n${text}`
      
      const response = await sseClient.sendMessage(prompt, {
        systemPrompt: 'You are a helpful assistant that creates clear, concise summaries. Focus on the key points and main ideas.'
      })
      
      return {
        success: true,
        data: response,
        metadata: {
          originalLength: text.length,
          summaryLength: response.length,
          compressionRatio: (response.length / text.length).toFixed(2)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate summary'
      }
    }
  }
} 