import type { SSEOptions } from "./types"

class SSEClient {
    private apiEndpoint: string = ''
    private apiKey: string = ''

    setConfig(endpoint: string, apiKey: string) {
        this.apiEndpoint = endpoint
        this.apiKey = apiKey
    }

    async sendMessage(prompt: string, options: SSEOptions = {}): Promise<string> {
        if (!this.apiEndpoint || !this.apiKey) {
            throw new Error('API endpoint and key must be configured')
        }
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                prompt,
                systemPrompt: options.systemPrompt,
                temperature: options.temperature || 0.7,
                maxTokens: options.maxTokens || 1000,
                stream: true
            })
        })

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
        }

        return this.processStream(response)
    }

    createEventSource(prompt: string, options: SSEOptions = {}): EventSource {
        if (!this.apiEndpoint || !this.apiKey) {
            throw new Error('API endpoint and key must be configured')
        }

        const params = new URLSearchParams({
            prompt,
            systemPrompt: options.systemPrompt || '',
            temperature: (options.temperature || 0.7).toString(),
            maxTokens: (options.maxTokens || 1000).toString()
        })

        const eventSource = new EventSource(
            `${this.apiEndpoint}/stream?${params.toString()}`,
            {
                withCredentials: true,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            } as any
        )

        return eventSource
    }

    private async processStream(response: Response): Promise<string> {
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let result = ''

        try {
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim()
                        if (data === '[DONE]') continue

                        try {
                            const parsed = JSON.parse(data)
                            if (parsed.content) {
                                result += parsed.content
                            }
                        } catch (e) {
                            console.error('Failed to parse SSE data:', e)
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock()
        }
        return result
    }

    async mockStreamResponse(prompt: string): Promise<string> {
        const mockResponses = {
            summarize: "This text provides a concise overview of the main points discussed. The key takeaways include the primary objectives, implementation strategies, and expected outcomes.",
            translate: "텍스트가 성공적으로 번역되었습니다. 주요 내용과 맥락이 유지되었으며, 자연스러운 표현으로 변환되었습니다.",
            rewrite: "The text has been professionally rewritten to enhance clarity and engagement. The tone is now more formal and suitable for business communication, while maintaining the original message.",
            explain: "Let me break this down in simple terms: The concept revolves around making complex information accessible to everyone. Think of it like translating technical jargon into everyday language that anyone can understand."
        }
        const responseText = mockResponses[prompt.toLowerCase().includes('summarize') ? 'summarize' :
            prompt.toLowerCase().includes('translate') ? 'translate' :
                prompt.toLowerCase().includes('rewrite') ? 'rewrite' : 'explain']
        await new Promise(resolve => setTimeout(resolve, 300))
        return responseText
    }
}

export const sseClient = new SSEClient() 