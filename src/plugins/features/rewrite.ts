import type { FeaturePlugin, FeatureResult } from '../../types/features'
import { sseClient } from '../../utils/sse'

export const rewritePlugin: FeaturePlugin = {
  id: 'rewrite',
  name: 'Rewrite',
  category: 'text',
  icon: '✏️',
  description: 'Rewrite text with improved clarity and style',
  enabled: true,
  
  async execute(text: string, options = { tone: 'professional' }): Promise<FeatureResult> {
    try {
      const tone = options.tone || 'professional'
      const prompt = `Rewrite the following text to be more ${tone} while maintaining the core message:\n\n${text}`
      
      const response = await sseClient.sendMessage(prompt, {
        systemPrompt: `You are an expert writer. Rewrite text to be clearer, more engaging, and ${tone} in tone. Improve grammar, structure, and flow while preserving the original meaning.`
      })
      
      return {
        success: true,
        data: response,
        metadata: {
          tone,
          originalWordCount: text.split(/\s+/).length,
          rewrittenWordCount: response.split(/\s+/).length
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to rewrite text'
      }
    }
  }
} 