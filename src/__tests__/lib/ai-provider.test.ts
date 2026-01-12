/* eslint-disable */
/**
 * @jest-environment jsdom
 */

import { AIProvider, getAIProvider, resetAIProvider } from '@/lib/ai-provider'
import type { AIMessage, AIProviderConfig } from '@/types/ai'

// Mock the @google/genai module
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: jest.fn()
        }
    }))
}))

// Mock the groq-sdk module
jest.mock('groq-sdk', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: jest.fn()
            }
        }
    }))
})

describe('AIProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        resetAIProvider()
    })

    describe('constructor', () => {
        it('should initialize with no providers when no keys provided', () => {
            const provider = new AIProvider({})
            expect(provider.hasAnyProvider).toBe(false)
            expect(provider.availableProviders).toEqual([])
        })

        it('should initialize Gemini client when API key provided', () => {
            const provider = new AIProvider({ geminiApiKey: 'test-gemini-key' })
            expect(provider.hasAnyProvider).toBe(true)
            expect(provider.availableProviders).toContain('gemini')
        })

        it('should initialize Groq client when API key provided', () => {
            const provider = new AIProvider({ groqApiKey: 'test-groq-key' })
            expect(provider.hasAnyProvider).toBe(true)
            expect(provider.availableProviders).toContain('groq')
        })

        it('should initialize both clients when both keys provided', () => {
            const provider = new AIProvider({
                geminiApiKey: 'test-gemini-key',
                groqApiKey: 'test-groq-key'
            })
            expect(provider.hasAnyProvider).toBe(true)
            expect(provider.availableProviders).toEqual(['gemini', 'groq'])
        })
    })

    describe('generateCompletion', () => {
        const testMessages: AIMessage[] = [
            { role: 'user', content: 'Hello' }
        ]

        it('should throw error when no providers configured', async () => {
            const provider = new AIProvider({})
            await expect(provider.generateCompletion(testMessages)).rejects.toThrow(
                'No AI providers configured'
            )
        })

        it('should use Gemini when only Gemini is configured', async () => {
            const { GoogleGenAI } = require('@google/genai')
            const mockGenerate = jest.fn().mockResolvedValue({ text: 'Gemini response' })
            GoogleGenAI.mockImplementation(() => ({
                models: { generateContent: mockGenerate }
            }))

            const provider = new AIProvider({ geminiApiKey: 'test-key' })
            const response = await provider.generateCompletion(testMessages)

            expect(response.provider).toBe('gemini')
            expect(response.text).toBe('Gemini response')
            expect(mockGenerate).toHaveBeenCalled()
        })

        it('should use Groq when only Groq is configured', async () => {
            const Groq = require('groq-sdk')
            const mockCreate = jest.fn().mockResolvedValue({
                choices: [{ message: { content: 'Groq response' } }]
            })
            Groq.mockImplementation(() => ({
                chat: { completions: { create: mockCreate } }
            }))

            const provider = new AIProvider({ groqApiKey: 'test-key' })
            const response = await provider.generateCompletion(testMessages)

            expect(response.provider).toBe('groq')
            expect(response.text).toBe('Groq response')
            expect(mockCreate).toHaveBeenCalled()
        })

        it('should fallback to Groq when Gemini fails', async () => {
            const { GoogleGenAI } = require('@google/genai')
            const Groq = require('groq-sdk')

            // Gemini fails
            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: jest.fn().mockRejectedValue(new Error('Gemini error'))
                }
            }))

            // Groq succeeds
            Groq.mockImplementation(() => ({
                chat: {
                    completions: {
                        create: jest.fn().mockResolvedValue({
                            choices: [{ message: { content: 'Groq fallback response' } }]
                        })
                    }
                }
            }))

            const provider = new AIProvider({
                geminiApiKey: 'test-gemini-key',
                groqApiKey: 'test-groq-key'
            })
            const response = await provider.generateCompletion(testMessages)

            expect(response.provider).toBe('groq')
            expect(response.text).toBe('Groq fallback response')
        })

        it('should throw error when both providers fail', async () => {
            const { GoogleGenAI } = require('@google/genai')
            const Groq = require('groq-sdk')

            GoogleGenAI.mockImplementation(() => ({
                models: {
                    generateContent: jest.fn().mockRejectedValue(new Error('Gemini error'))
                }
            }))

            Groq.mockImplementation(() => ({
                chat: {
                    completions: {
                        create: jest.fn().mockRejectedValue(new Error('Groq error'))
                    }
                }
            }))

            const provider = new AIProvider({
                geminiApiKey: 'test-gemini-key',
                groqApiKey: 'test-groq-key'
            })

            await expect(provider.generateCompletion(testMessages)).rejects.toThrow(
                'All AI providers failed'
            )
        })
    })

    describe('prompt', () => {
        it('should create completion with system prompt when provided', async () => {
            const { GoogleGenAI } = require('@google/genai')
            const mockGenerate = jest.fn().mockResolvedValue({ text: 'Response' })
            GoogleGenAI.mockImplementation(() => ({
                models: { generateContent: mockGenerate }
            }))

            const provider = new AIProvider({ geminiApiKey: 'test-key' })
            const result = await provider.prompt('Hello', 'You are helpful')

            expect(result).toBe('Response')
            expect(mockGenerate).toHaveBeenCalled()
        })
    })

    describe('getAIProvider singleton', () => {
        it('should return same instance when called without config', () => {
            const config: AIProviderConfig = { geminiApiKey: 'test-key' }
            const provider1 = getAIProvider(config)
            const provider2 = getAIProvider()

            expect(provider1).toBe(provider2)
        })

        it('should create new instance when called with new config', () => {
            const provider1 = getAIProvider({ geminiApiKey: 'key1' })
            const provider2 = getAIProvider({ geminiApiKey: 'key2' })

            expect(provider1).not.toBe(provider2)
        })

        it('should reset provider correctly', () => {
            const provider1 = getAIProvider({ geminiApiKey: 'test-key' })
            resetAIProvider()
            const provider2 = getAIProvider({ geminiApiKey: 'test-key' })

            expect(provider1).not.toBe(provider2)
        })
    })
})
