'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AIProviderConfig, AIProviderStatus } from '@/types/ai'
import { getAIProvider, resetAIProvider } from '@/lib/ai-provider'

const STORAGE_KEYS = {
    gemini: 'horizonview_gemini_key',
    groq: 'horizonview_groq_key'
} as const

// Helper to get initial config from localStorage (runs only once)
function getInitialConfig(): AIProviderConfig {
    if (typeof window === 'undefined') return {}
    
    const geminiKey = localStorage.getItem(STORAGE_KEYS.gemini)
    const groqKey = localStorage.getItem(STORAGE_KEYS.groq)
    
    return {
        geminiApiKey: geminiKey || undefined,
        groqApiKey: groqKey || undefined
    }
}

export function useAISettings() {
    const [config, setConfig] = useState<AIProviderConfig>(getInitialConfig)
    const [isLoaded, setIsLoaded] = useState(false)
    const initializedRef = useRef(false)

    // Initialize provider on mount (only runs once)
    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true
        
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoaded(true)
        
        // Initialize provider with stored keys
        if (config.geminiApiKey || config.groqApiKey) {
            getAIProvider(config)
        }
    }, [config])

    const saveKeys = useCallback((geminiKey: string, groqKey: string) => {
        // Save to localStorage
        if (geminiKey) {
            localStorage.setItem(STORAGE_KEYS.gemini, geminiKey)
        } else {
            localStorage.removeItem(STORAGE_KEYS.gemini)
        }

        if (groqKey) {
            localStorage.setItem(STORAGE_KEYS.groq, groqKey)
        } else {
            localStorage.removeItem(STORAGE_KEYS.groq)
        }

        // Update state
        const newConfig = {
            geminiApiKey: geminiKey || undefined,
            groqApiKey: groqKey || undefined
        }
        setConfig(newConfig)

        // Reset and reinitialize provider
        resetAIProvider()
        getAIProvider(newConfig)
    }, [])

    const clearKeys = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.gemini)
        localStorage.removeItem(STORAGE_KEYS.groq)
        setConfig({})
        resetAIProvider()
    }, [])

    const providerStatus: AIProviderStatus = {
        gemini: !!config.geminiApiKey,
        groq: !!config.groqApiKey
    }

    const hasAnyProvider = providerStatus.gemini || providerStatus.groq

    return {
        config,
        isLoaded,
        saveKeys,
        clearKeys,
        providerStatus,
        hasAnyProvider
    }
}
