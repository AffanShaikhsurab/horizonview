'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useChatStore } from '@/stores/chat-store'
import { useAISettings } from '@/hooks/use-ai-settings'
import { getAIProvider } from '@/lib/ai-provider'
import { useMissionsWithProjects } from '@/hooks/use-horizon'
import { MarkdownRenderer } from '@/components/assistant-ui/markdown-text'
import { AISettings } from '@/components/ai-settings'
import { SendIcon, CopyIcon, CheckIcon, RefreshCwIcon, SparklesIcon, UserIcon, BotIcon, ArrowDownIcon, XIcon, PlusIcon, Trash2Icon, Edit2Icon, SettingsIcon } from 'lucide-react'

function CopyButton({ content }: { content: string }) {
    const [copied, setCopied] = useState(false)
    
    return (
        <button
            className="aui-action-btn"
            onClick={() => {
                navigator.clipboard.writeText(content)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }}
            aria-label="Copy message"
        >
            {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        </button>
    )
}

function WelcomeScreen({ onStartChat, onOpenSettings }: { onStartChat: (message: string) => void, onOpenSettings: () => void }) {
    const suggestions = [
        "What should I focus on today?",
        "Analyze my current project load",
        "How can I improve my focus score?",
        "Show me an overview of my missions",
    ]
    
    return (
        <div className="aui-welcome" role="region" aria-label="Welcome screen">
            <div className="aui-welcome-icon" aria-hidden="true">
                <SparklesIcon className="size-8" />
            </div>
            <h2 className="aui-welcome-title">Horizon Assistant</h2>
            <p className="aui-welcome-text">
                Ask me anything about your missions, projects, or get productivity advice.
            </p>
            <div className="aui-suggestions" role="list" aria-label="Suggested questions">
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        className="aui-suggestion-btn"
                        onClick={() => onStartChat(suggestion)}
                        role="listitem"
                        aria-label={`Ask: ${suggestion}`}
                    >
                        {suggestion}
                    </button>
                ))}
                <button
                    className="aui-suggestion-btn aui-settings-btn"
                    onClick={onOpenSettings}
                    role="listitem"
                    aria-label="Configure AI keys"
                >
                    <SettingsIcon className="size-4" />
                    Configure AI Keys
                </button>
            </div>
        </div>
    )
}

function MessageBubble({ message, onRetry, onOpenSettings, isNew }: { message: any, onRetry?: () => void, onOpenSettings?: () => void, isNew?: boolean }) {
    const isUser = message.role === 'user'
    
    return (
        <article 
            className={`message ${isUser ? 'message-user' : 'message-assistant'} ${isNew ? 'message-new' : ''}`}
            role={isUser ? 'user' : 'assistant'}
            aria-label={`${isUser ? 'You' : 'Assistant'} message`}
        >
            <div className="message-avatar" aria-hidden="true">
                {isUser ? <UserIcon className="size-4" /> : <BotIcon className="size-4" />}
            </div>
            <div className="message-content">
                {message.error && (
                    <div className="message-error" role="alert" aria-live="assertive">
                        <p>{message.error}</p>
                        <div className="error-actions">
                            {onOpenSettings && (
                                <button
                                    onClick={onOpenSettings}
                                    className="retry-btn"
                                    aria-label="Configure AI keys"
                                >
                                    <SettingsIcon className="size-4" />
                                    Configure Keys
                                </button>
                            )}
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className="retry-btn"
                                    aria-label="Retry sending this message"
                                >
                                    <RefreshCwIcon className="size-4" />
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                )}
                <div className="message-text" role="document">
                    <MarkdownRenderer content={message.content} />
                </div>
                {!isUser && !message.error && (
                    <div className="message-actions">
                        <CopyButton content={message.content} />
                    </div>
                )}
                {message.isStreaming && (
                    <div className="streaming-indicator" aria-label="Assistant is typing" aria-live="polite">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
            </div>
        </article>
    )
}

function SessionSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const { sessions, currentSessionId, setCurrentSessionId, createSession, deleteSession, renameSession } = useChatStore()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingTitle, setEditingTitle] = useState('')
    
    const handleStartEdit = (id: string, title: string) => {
        setEditingId(id)
        setEditingTitle(title)
    }
    
    const handleSaveEdit = () => {
        if (editingId && editingTitle.trim()) {
            renameSession(editingId, editingTitle.trim())
        }
        setEditingId(null)
        setEditingTitle('')
    }
    
    return (
        <aside 
            className={`chat-sidebar ${isOpen ? 'open' : ''}`}
            role="dialog"
            aria-label="Chat history sidebar"
            aria-modal="true"
        >
            <div className="sidebar-header">
                <h2>Chat History</h2>
                <button
                    onClick={() => {
                        createSession()
                        onClose()
                    }}
                    className="new-chat-btn"
                    aria-label="Start a new chat"
                >
                    <PlusIcon className="size-4" />
                    New Chat
                </button>
            </div>
            <div className="sidebar-content" role="list" aria-label="Chat sessions">
                {sessions.length === 0 ? (
                    <p className="sidebar-empty" role="status">No chats yet</p>
                ) : (
                    sessions.map(session => (
                        <div
                            key={session.id}
                            className={`sidebar-item ${session.id === currentSessionId ? 'active' : ''}`}
                            role="listitem"
                        >
                            {editingId === session.id ? (
                                <input
                                    type="text"
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onBlur={handleSaveEdit}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveEdit()
                                        if (e.key === 'Escape') {
                                            setEditingId(null)
                                            setEditingTitle('')
                                        }
                                    }}
                                    className="session-edit-input"
                                    autoFocus
                                    aria-label="Edit chat title"
                                />
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setCurrentSessionId(session.id)
                                            onClose()
                                        }}
                                        className="session-title"
                                        aria-label={`Open chat: ${session.title}`}
                                        aria-current={session.id === currentSessionId ? 'page' : undefined}
                                    >
                                        {session.title}
                                    </button>
                                    <div className="session-actions">
                                        <button
                                            onClick={() => handleStartEdit(session.id, session.title)}
                                            className="session-action-btn"
                                            aria-label={`Rename chat: ${session.title}`}
                                        >
                                            <Edit2Icon className="size-3" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this chat?')) {
                                                    deleteSession(session.id)
                                                }
                                            }}
                                            className="session-action-btn"
                                            aria-label={`Delete chat: ${session.title}`}
                                        >
                                            <Trash2Icon className="size-3" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </aside>
    )
}

export function ChatInterface() {
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const [showScrollButton, setShowScrollButton] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set())
    const [hasNewMessages, setHasNewMessages] = useState(false)
    const [isAISettingsOpen, setIsAISettingsOpen] = useState(false)
    const lastMessageCountRef = useRef(0)
    const streamingUpdateTimerRef = useRef<NodeJS.Timeout | null>(null)
    const lastStreamingUpdateRef = useRef(0)
    
    const { config, hasAnyProvider } = useAISettings()
    const { data: missions } = useMissionsWithProjects()
    const { 
        currentSessionId, 
        setCurrentSessionId,
        createSession,
        addMessage,
        updateMessage,
        getCurrentMessages,
        getCurrentSession,
        markMessageError,
        setMessageStreaming,
        streamMessageUpdate,
        flushStreamingUpdates
    } = useChatStore()
    
    const messages = getCurrentMessages()
    
    return (
        <>
            <ChatInterfaceContent 
                router={router}
                messagesEndRef={messagesEndRef}
                inputRef={inputRef}
                input={input}
                setInput={setInput}
                isSending={isSending}
                setIsSending={setIsSending}
                showScrollButton={showScrollButton}
                setShowScrollButton={setShowScrollButton}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                newMessageIds={newMessageIds}
                setNewMessageIds={setNewMessageIds}
                hasNewMessages={hasNewMessages}
                setHasNewMessages={setHasNewMessages}
                isAISettingsOpen={isAISettingsOpen}
                setIsAISettingsOpen={setIsAISettingsOpen}
                lastMessageCountRef={lastMessageCountRef}
                streamingUpdateTimerRef={streamingUpdateTimerRef}
                lastStreamingUpdateRef={lastStreamingUpdateRef}
                config={config}
                hasAnyProvider={hasAnyProvider}
                missions={missions}
                currentSessionId={currentSessionId}
                setCurrentSessionId={setCurrentSessionId}
                createSession={createSession}
                addMessage={addMessage}
                updateMessage={updateMessage}
                getCurrentMessages={getCurrentMessages}
                getCurrentSession={getCurrentSession}
                markMessageError={markMessageError}
                setMessageStreaming={setMessageStreaming}
                streamMessageUpdate={streamMessageUpdate}
                flushStreamingUpdates={flushStreamingUpdates}
                messages={messages}
            />
            <AISettings isOpen={isAISettingsOpen} onClose={() => setIsAISettingsOpen(false)} />
        </>
    )
}

function ChatInterfaceContent({
    router,
    messagesEndRef,
    inputRef,
    input,
    setInput,
    isSending,
    setIsSending,
    showScrollButton,
    setShowScrollButton,
    sidebarOpen,
    setSidebarOpen,
    newMessageIds,
    setNewMessageIds,
    hasNewMessages,
    setHasNewMessages,
    isAISettingsOpen,
    setIsAISettingsOpen,
    lastMessageCountRef,
    streamingUpdateTimerRef,
    lastStreamingUpdateRef,
    config,
    hasAnyProvider,
    missions,
    currentSessionId,
    setCurrentSessionId,
    createSession,
    addMessage,
    updateMessage,
    getCurrentMessages,
    getCurrentSession,
    markMessageError,
    setMessageStreaming,
    streamMessageUpdate,
    flushStreamingUpdates,
    messages
}: any) {
    const searchParams = useSearchParams()
    
    useEffect(() => {
        const query = searchParams.get('q')
        if (query && messages.length === 0) {
            setInput(query)
            setTimeout(() => handleSubmit(query), 100)
        }
    }, [searchParams])
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])
    
    useEffect(() => {
        if (messages.length > lastMessageCountRef.current) {
            const newIds = new Set(newMessageIds)
            for (let i = lastMessageCountRef.current; i < messages.length; i++) {
                newIds.add(messages[i].id)
            }
            setNewMessageIds(newIds)
            setHasNewMessages(true)
            
            const container = document.querySelector('.chat-messages') as HTMLElement
            const isAtBottom = container 
                ? (container.scrollHeight - container.scrollTop - container.clientHeight) < 100
                : true
            
            if (isAtBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
                setTimeout(() => {
                    setHasNewMessages(false)
                }, 100)
            }
        }
        lastMessageCountRef.current = messages.length
    }, [messages])
    
    useEffect(() => {
        const container = document.querySelector('.chat-messages')
        if (!container) return
        
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container as HTMLElement
            const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
            setShowScrollButton(!isAtBottom)
            
            if (isAtBottom) {
                setHasNewMessages(false)
            }
        }
        
        container.addEventListener('scroll', handleScroll)
        return () => container.removeEventListener('scroll', handleScroll)
    }, [])
    
    useEffect(() => {
        if (!currentSessionId) {
            createSession()
        }
    }, [currentSessionId, createSession])
    
    useEffect(() => {
        return () => {
            if (streamingUpdateTimerRef.current) {
                clearTimeout(streamingUpdateTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault()
                if (input.trim() && !isSending) {
                    handleSubmit()
                }
            }
        }

        window.addEventListener('keydown', handleGlobalKeyDown)
        return () => window.removeEventListener('keydown', handleGlobalKeyDown)
    }, [input, isSending])
    
    const handleSubmit = async (messageContent?: string) => {
        const content = messageContent || input.trim()
        if (!content || isSending) return

        const isConfigCommand = /^(ai\s*settings?|settings?|configure\s*ai|api\s*keys?)$/i.test(content)
        
        if (isConfigCommand) {
            setInput('')
            setIsAISettingsOpen(true)
            return
        }
        
        if (!hasAnyProvider) {
            setIsSending(true)
            setInput('')
            
            const sessionId = currentSessionId || createSession(content)
            setCurrentSessionId(sessionId)
            
            addMessage(sessionId, {
                role: 'user',
                content,
            })
            
            const assistantMessageId = `msg_${Date.now()}_assistant`
            addMessage(sessionId, {
                role: 'assistant',
                content: '',
                isStreaming: false,
                error: 'Please configure your AI keys to use Horizon Assistant.',
            })
            setIsSending(false)
            return
        }
        
        setIsSending(true)
        setInput('')
        
        const sessionId = currentSessionId || createSession(content)
        setCurrentSessionId(sessionId)
        
        addMessage(sessionId, {
            role: 'user',
            content,
        })
        
        const assistantMessageId = `msg_${Date.now()}_assistant`
        addMessage(sessionId, {
            role: 'assistant',
            content: '',
            isStreaming: true,
        })
        
        try {
            const context = missions ? {
                missions: missions.map((m: any) => ({
                    title: m.title,
                    projects: m.projects.map((p: any) => ({
                        title: p.title,
                        status: p.status,
                        progress: p.progress,
                    })),
                })),
            } : undefined
            
            const provider = getAIProvider(config)
            const chatHistory = getCurrentMessages()
                .filter((m: any) => m.role !== 'system')
                .map((m: any) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                }))
            
            const response = await provider.generateCompletion([
                { 
                    role: 'system', 
                    content: 'You are Horizon Assistant, a helpful AI assistant for the Horizon OS productivity dashboard. Provide clear, concise advice about missions, projects, and productivity. Use markdown formatting when helpful.' 
                },
                ...chatHistory.slice(0, -1),
                { role: 'user', content },
            ])
            
            const messages = getCurrentMessages()
            const lastAssistantMessage = messages.filter((m: any) => m.role === 'assistant').pop()
            
            if (lastAssistantMessage) {
                updateMessage(sessionId, lastAssistantMessage.id, {
                    content: response.text,
                    isStreaming: false,
                })
            }
        } catch (error) {
            console.error('Chat error:', error)
            const messages = getCurrentMessages()
            const lastAssistantMessage = messages.filter((m: any) => m.role === 'assistant').pop()
            
            if (lastAssistantMessage) {
                markMessageError(
                    sessionId, 
                    lastAssistantMessage.id, 
                    'Failed to generate response. Please try again.'
                )
            }
        } finally {
            setIsSending(false)
            if (streamingUpdateTimerRef.current) {
                clearTimeout(streamingUpdateTimerRef.current)
            }
            flushStreamingUpdates()
        }
    }
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            if (sidebarOpen) {
                setSidebarOpen(false)
            } else if (input.trim()) {
                setInput('')
            }
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault()
            setSidebarOpen(!sidebarOpen)
        }
    }
    
    const handleRetry = async (messageIndex: number) => {
        const messages = getCurrentMessages()
        const messageToRetry = messages[messageIndex]
        
        if (messageToRetry?.role === 'user') {
            const userContent = messageToRetry.content
            const messagesAfterRetry = messages.slice(messageIndex + 1)
            
            messagesAfterRetry.forEach((m: any) => {
                useChatStore.getState().deleteMessage(currentSessionId!, m.id)
            })
            
            await handleSubmit(userContent)
        }
    }
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        setHasNewMessages(false)
    }
    
    return (
        <div className="chat-container" id="chat-main">
            <SessionSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <header className="chat-header">
                <div className="header-left">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="menu-btn"
                        aria-label="Toggle chat history"
                    >
                        <div className="menu-icon">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>
                    <h1>
                        <SparklesIcon className="size-5" />
                        Horizon Assistant
                        {hasNewMessages && <span className="new-message-badge" aria-label="New messages available">•</span>}
                    </h1>
                </div>
                <button
                    onClick={() => router.push('/')}
                    className="close-btn"
                    aria-label="Close chat"
                >
                    <XIcon className="size-5" />
                </button>
            </header>
            
            <div className="chat-messages" role="log" aria-live="polite" aria-label="Chat messages">
                {messages.length === 0 ? (
                    <WelcomeScreen 
                        onStartChat={(msg) => setInput(msg)} 
                        onOpenSettings={() => setIsAISettingsOpen(true)} 
                    />
                ) : (
                    <>
                        {messages.map((message: any, index: number) => (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                onRetry={message.error ? () => handleRetry(index) : undefined}
                                onOpenSettings={message.error ? () => setIsAISettingsOpen(true) : undefined}
                                isNew={newMessageIds.has(message.id)}
                            />
                        ))}
                        <div ref={messagesEndRef} aria-hidden="true" />
                    </>
                )}
            </div>
            
            {(showScrollButton || hasNewMessages) && (
                <button
                    onClick={scrollToBottom}
                    className={`scroll-to-bottom ${hasNewMessages ? 'scroll-to-bottom-new' : ''}`}
                    aria-label={hasNewMessages ? "Scroll to see new messages" : "Scroll to bottom"}
                >
                    {hasNewMessages ? (
                        <span className="new-message-indicator" aria-hidden="true">
                            <span className="new-message-dot"></span>
                            <span className="new-message-dot"></span>
                            <span className="new-message-dot"></span>
                        </span>
                    ) : (
                        <ArrowDownIcon className="size-4" />
                    )}
                </button>
            )}
            
            <form className="chat-composer" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Horizon Assistant anything..."
                    className="chat-input"
                    rows={1}
                    disabled={isSending}
                    aria-label="Chat input"
                />
                <button
                    type="submit"
                    className="send-btn"
                    disabled={!input.trim() || isSending}
                    aria-label="Send message"
                >
                    {isSending ? (
                        <div className="spinner" />
                    ) : (
                        <SendIcon className="size-4" />
                    )}
                </button>
            </form>
        </div>
    )
}
