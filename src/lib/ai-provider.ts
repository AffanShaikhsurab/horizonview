import { GoogleGenAI } from '@google/genai'
import Groq from 'groq-sdk'
import type { AIProviderConfig, AIMessage, AIResponse, AIError } from '@/types/ai'

const GEMINI_MODEL = 'gemini-2.0-flash'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export class AIProvider {
    private geminiClient: GoogleGenAI | null = null
    private groqClient: Groq | null = null

    constructor(config: AIProviderConfig) {
        if (config.geminiApiKey) {
            this.geminiClient = new GoogleGenAI({ apiKey: config.geminiApiKey })
        }
        if (config.groqApiKey) {
            this.groqClient = new Groq({ apiKey: config.groqApiKey, dangerouslyAllowBrowser: true })
        }
    }

    get hasAnyProvider(): boolean {
        return this.geminiClient !== null || this.groqClient !== null
    }

    get availableProviders(): string[] {
        const providers: string[] = []
        if (this.geminiClient) providers.push('gemini')
        if (this.groqClient) providers.push('groq')
        return providers
    }

    private async generateWithGemini(messages: AIMessage[]): Promise<AIResponse> {
        if (!this.geminiClient) {
            throw new Error('Gemini client not configured')
        }

        // Convert messages to Gemini format
        const systemMessage = messages.find(m => m.role === 'system')
        const contents = messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }))

        const response = await this.geminiClient.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents.map(c => c.parts[0].text).join('\n'),
            config: systemMessage ? { systemInstruction: systemMessage.content } : undefined
        })

        return {
            text: response.text ?? '',
            provider: 'gemini',
            model: GEMINI_MODEL
        }
    }

    private async generateWithGroq(messages: AIMessage[]): Promise<AIResponse> {
        if (!this.groqClient) {
            throw new Error('Groq client not configured')
        }

        const response = await this.groqClient.chat.completions.create({
            messages: messages.map(m => ({
                role: m.role,
                content: m.content
            })),
            model: GROQ_MODEL,
            temperature: 0.7,
            max_tokens: 1024
        })

        return {
            text: response.choices[0]?.message?.content ?? '',
            provider: 'groq',
            model: GROQ_MODEL
        }
    }

    async generateCompletion(messages: AIMessage[]): Promise<AIResponse> {
        const errors: AIError[] = []

        // Try Gemini first
        if (this.geminiClient) {
            try {
                return await this.generateWithGemini(messages)
            } catch (error) {
                errors.push({
                    message: error instanceof Error ? error.message : 'Gemini request failed',
                    provider: 'gemini'
                })
                console.warn('Gemini failed, falling back to Groq:', error)
            }
        }

        // Fall back to Groq
        if (this.groqClient) {
            try {
                return await this.generateWithGroq(messages)
            } catch (error) {
                errors.push({
                    message: error instanceof Error ? error.message : 'Groq request failed',
                    provider: 'groq'
                })
                console.error('Groq also failed:', error)
            }
        }

        // Both failed or no providers configured
        if (errors.length === 0) {
            throw new Error('No AI providers configured. Please add your API keys in settings.')
        }

        throw new Error(
            `All AI providers failed:\n${errors.map(e => `${e.provider}: ${e.message}`).join('\n')}`
        )
    }

    // Convenience method for simple prompts
    async prompt(text: string, systemPrompt?: string): Promise<string> {
        const messages: AIMessage[] = []

        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt })
        }
        messages.push({ role: 'user', content: text })

        const response = await this.generateCompletion(messages)
        return response.text
    }
}

// Singleton helper for client-side usage
let clientProvider: AIProvider | null = null

export function getAIProvider(config?: AIProviderConfig): AIProvider {
    if (config) {
        clientProvider = new AIProvider(config)
    }
    if (!clientProvider) {
        clientProvider = new AIProvider({})
    }
    return clientProvider
}

export function resetAIProvider(): void {
    clientProvider = null
}
