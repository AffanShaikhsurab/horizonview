'use client'

import { ReactNode, useMemo, useEffect, useState } from 'react'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk'
import { useAISettings } from '@/hooks/use-ai-settings'
import { useMissionsWithProjects } from '@/hooks/use-horizon'

interface AssistantProviderProps {
    children: ReactNode
}

export function AssistantProvider({ children }: AssistantProviderProps) {
    const { config, isLoaded } = useAISettings()
    const { data: missions } = useMissionsWithProjects()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        requestAnimationFrame(() => {
            setMounted(true)
        })
    }, [])

    // Create context object
    const context = useMemo(() => {
        if (!missions || missions.length === 0) return undefined
        return {
            missions: missions.map(m => ({
                title: m.title,
                projects: m.projects.map(p => ({
                    title: p.title,
                    status: p.status,
                    progress: p.progress,
                })),
            })),
        }
    }, [missions])

    // Create headers with API keys
    const headers = useMemo(() => {
        const h: Record<string, string> = {}
        if (config.geminiApiKey) {
            h['x-gemini-key'] = config.geminiApiKey
        }
        if (config.groqApiKey) {
            h['x-groq-key'] = config.groqApiKey
        }
        return h
    }, [config.geminiApiKey, config.groqApiKey])

    // Create transport
    const transport = useMemo(() => {
        return new AssistantChatTransport({
            api: '/api/chat',
            headers,
            body: { context },
        })
    }, [headers, context])

    // Use the AI SDK chat runtime
    const runtime = useChatRuntime({
        transport,
    })

    // Don't render until client-side to avoid hydration issues
    if (!mounted || !isLoaded) {
        return null
    }

    return (
        <AssistantRuntimeProvider runtime={runtime}>
            {children}
        </AssistantRuntimeProvider>
    )
}
