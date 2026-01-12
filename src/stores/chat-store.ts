import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: number
    error?: string
    isStreaming?: boolean
}

export interface ChatSession {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: number
    updatedAt: number
}

interface ChatStore {
    sessions: ChatSession[]
    currentSessionId: string | null
    pendingMessage: string | null
    streamingUpdateQueue: Map<string, { sessionId: string, content: string, timestamp: number }>
    
    setCurrentSessionId: (id: string | null) => void
    setPendingMessage: (message: string | null) => void
    
    createSession: (initialMessage?: string) => string
    deleteSession: (id: string) => void
    renameSession: (id: string, title: string) => void
    
    addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
    updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void
    deleteMessage: (sessionId: string, messageId: string) => void
    
    clearSession: (sessionId: string) => void
    getMessages: (sessionId: string) => ChatMessage[]
    getCurrentMessages: () => ChatMessage[]
    getCurrentSession: () => ChatSession | null
    
    markMessageError: (sessionId: string, messageId: string, error: string) => void
    setMessageStreaming: (sessionId: string, messageId: string, isStreaming: boolean) => void
    
    streamMessageUpdate: (sessionId: string, messageId: string, content: string) => void
    flushStreamingUpdates: () => void
}

export const useChatStore = create<ChatStore>()(
    persist(
        (set, get) => ({
            sessions: [],
            currentSessionId: null,
            pendingMessage: null,
            streamingUpdateQueue: new Map(),
            
            setCurrentSessionId: (id) => set({ currentSessionId: id }),
            setPendingMessage: (message) => set({ pendingMessage: message }),
            
            createSession: (initialMessage) => {
                const newSession: ChatSession = {
                    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    title: initialMessage?.slice(0, 50) || 'New Chat',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }
                
                if (initialMessage) {
                    newSession.messages.push({
                        id: `msg_${Date.now()}`,
                        role: 'user',
                        content: initialMessage,
                        timestamp: Date.now(),
                    })
                }
                
                set((state) => ({
                    sessions: [newSession, ...state.sessions],
                    currentSessionId: newSession.id,
                }))
                
                return newSession.id
            },
            
            deleteSession: (id) => {
                set((state) => {
                    const newSessions = state.sessions.filter(s => s.id !== id)
                    const newCurrentId = state.currentSessionId === id ? null : state.currentSessionId
                    return {
                        sessions: newSessions,
                        currentSessionId: newCurrentId,
                    }
                })
            },
            
            renameSession: (id, title) => {
                set((state) => ({
                    sessions: state.sessions.map(s =>
                        s.id === id ? { ...s, title, updatedAt: Date.now() } : s
                    ),
                }))
            },
            
            addMessage: (sessionId, message) => {
                set((state) => ({
                    sessions: state.sessions.map(s => {
                        if (s.id !== sessionId) return s
                        
                        const newMessage: ChatMessage = {
                            ...message,
                            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            timestamp: Date.now(),
                        }
                        
                        return {
                            ...s,
                            messages: [...s.messages, newMessage],
                            updatedAt: Date.now(),
                        }
                    }),
                }))
            },
            
            updateMessage: (sessionId, messageId, updates) => {
                set((state) => ({
                    sessions: state.sessions.map(s => {
                        if (s.id !== sessionId) return s
                        
                        return {
                            ...s,
                            messages: s.messages.map(m =>
                                m.id === messageId ? { ...m, ...updates } : m
                            ),
                            updatedAt: Date.now(),
                        }
                    }),
                }))
            },
            
            deleteMessage: (sessionId, messageId) => {
                set((state) => ({
                    sessions: state.sessions.map(s => {
                        if (s.id !== sessionId) return s
                        
                        return {
                            ...s,
                            messages: s.messages.filter(m => m.id !== messageId),
                            updatedAt: Date.now(),
                        }
                    }),
                }))
            },
            
            clearSession: (sessionId) => {
                set((state) => ({
                    sessions: state.sessions.map(s =>
                        s.id === sessionId
                            ? { ...s, messages: [], updatedAt: Date.now() }
                            : s
                    ),
                }))
            },
            
            getMessages: (sessionId) => {
                const session = get().sessions.find(s => s.id === sessionId)
                return session?.messages || []
            },
            
            getCurrentMessages: () => {
                const { currentSessionId, sessions } = get()
                if (!currentSessionId) return []
                const session = sessions.find(s => s.id === currentSessionId)
                return session?.messages || []
            },
            
            getCurrentSession: () => {
                const { currentSessionId, sessions } = get()
                if (!currentSessionId) return null
                return sessions.find(s => s.id === currentSessionId) || null
            },
            
            markMessageError: (sessionId, messageId, error) => {
                get().updateMessage(sessionId, messageId, { error, isStreaming: false })
            },
            
            setMessageStreaming: (sessionId, messageId, isStreaming) => {
                get().updateMessage(sessionId, messageId, { isStreaming })
            },
            
            streamMessageUpdate: (sessionId, messageId, content) => {
                const state = get()
                const key = `${sessionId}_${messageId}`
                
                const queue = new Map(state.streamingUpdateQueue)
                queue.set(key, { sessionId, content, timestamp: Date.now() })
                set({ streamingUpdateQueue: queue })
                
                const existingMessage = state.sessions
                    .find(s => s.id === sessionId)
                    ?.messages.find(m => m.id === messageId)
                
                if (existingMessage) {
                    get().updateMessage(sessionId, messageId, { content })
                }
            },
            
            flushStreamingUpdates: () => {
                set({ streamingUpdateQueue: new Map() })
            },
        }),
        {
            name: 'horizon-chat-storage',
            partialize: (state) => ({
                sessions: state.sessions,
                currentSessionId: state.currentSessionId,
            }),
            onRehydrateStorage: () => (state) => {
                state?.streamingUpdateQueue.clear()
            },
        }
    )
)
