// AI Provider Types

export interface AIProviderConfig {
    geminiApiKey?: string
    groqApiKey?: string
}

export interface AIMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

export interface AIResponse {
    text: string
    provider: 'gemini' | 'groq'
    model: string
}

export interface AIError {
    message: string
    provider: 'gemini' | 'groq' | 'none'
    code?: string
}

export type AIProviderStatus = {
    gemini: boolean
    groq: boolean
}
