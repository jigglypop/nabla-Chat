export type FeatureCategory = 'text' | 'email' | 'code' | 'document'

export interface FeaturePlugin {
    id: string
    name: string
    category: FeatureCategory
    icon: string
    description: string
    defaultPrompt?: string
    enabled: boolean
    customPrompt?: string; // 사용자가 설정한 커스텀 프롬프트
    execute: (text: string) => Promise<FeatureResult>;
}

export interface FeatureOptions {
    language?: string
    tone?: 'formal' | 'casual' | 'professional'
    format?: 'plain' | 'markdown' | 'html'
    apiEndpoint?: string
}

export interface FeatureResult {
    success: boolean
    data?: string
    error?: string
    metadata?: Record<string, any>
}

export interface StreamingFeatureResult extends FeatureResult {
    stream?: ReadableStream<string>
} 