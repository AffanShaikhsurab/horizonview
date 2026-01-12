'use client'

import { useState } from 'react'
import {
    ThreadPrimitive,
    ComposerPrimitive,
    MessagePrimitive,
    ActionBarPrimitive,
} from '@assistant-ui/react'
import { MarkdownText } from './markdown-text'
import {
    SendIcon,
    CopyIcon,
    CheckIcon,
    RefreshCwIcon,
    SparklesIcon,
    UserIcon,
    BotIcon,
    ArrowDownIcon
} from 'lucide-react'

// Copy button with feedback
function CopyButton() {
    const [copied, setCopied] = useState(false)

    return (
        <ActionBarPrimitive.Copy
            className="aui-action-btn"
            onClick={() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }}
        >
            {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
        </ActionBarPrimitive.Copy>
    )
}

// User message component
function UserMessage() {
    return (
        <MessagePrimitive.Root className="aui-message aui-message-user">
            <div className="aui-message-avatar aui-avatar-user">
                <UserIcon className="size-4" />
            </div>
            <div className="aui-message-content">
                <MessagePrimitive.Content components={{ Text: MarkdownText }} />
            </div>
        </MessagePrimitive.Root>
    )
}

// Assistant message component with actions
function AssistantMessage() {
    return (
        <MessagePrimitive.Root className="aui-message aui-message-assistant">
            <div className="aui-message-avatar aui-avatar-assistant">
                <BotIcon className="size-4" />
            </div>
            <div className="aui-message-content">
                <MessagePrimitive.Content components={{ Text: MarkdownText }} />
                <div className="aui-action-bar">
                    <CopyButton />
                    <ActionBarPrimitive.Reload className="aui-action-btn">
                        <RefreshCwIcon className="size-4" />
                    </ActionBarPrimitive.Reload>
                </div>
            </div>
        </MessagePrimitive.Root>
    )
}

// Welcome screen when thread is empty
function WelcomeScreen() {
    return (
        <div className="aui-welcome">
            <div className="aui-welcome-icon">
                <SparklesIcon className="size-8" />
            </div>
            <h2 className="aui-welcome-title">Horizon Assistant</h2>
            <p className="aui-welcome-text">
                Ask me anything about your missions, projects, or get productivity advice.
            </p>
            <div className="aui-suggestions">
                <ThreadPrimitive.Suggestion
                    prompt="What should I focus on today?"
                    className="aui-suggestion-btn"
                >
                    What should I focus on today?
                </ThreadPrimitive.Suggestion>
                <ThreadPrimitive.Suggestion
                    prompt="Analyze my current project load"
                    className="aui-suggestion-btn"
                >
                    Analyze my project load
                </ThreadPrimitive.Suggestion>
                <ThreadPrimitive.Suggestion
                    prompt="How can I improve my focus score?"
                    className="aui-suggestion-btn"
                >
                    Improve my focus score
                </ThreadPrimitive.Suggestion>
            </div>
        </div>
    )
}

// Scroll to bottom button
function ScrollToBottomButton() {
    return (
        <ThreadPrimitive.ScrollToBottom className="aui-scroll-to-bottom">
            <ArrowDownIcon className="size-4" />
        </ThreadPrimitive.ScrollToBottom>
    )
}

// Composer with send button
function Composer() {
    return (
        <ComposerPrimitive.Root className="aui-composer">
            <ComposerPrimitive.Input
                className="aui-composer-input"
                placeholder="Ask Horizon Assistant..."
                rows={1}
                autoFocus
            />
            <ComposerPrimitive.Send className="aui-composer-send">
                <SendIcon className="size-4" />
            </ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
    )
}

export function Thread() {
    return (
        <ThreadPrimitive.Root className="aui-thread">
            <ThreadPrimitive.Viewport className="aui-viewport">
                <ThreadPrimitive.Empty>
                    <WelcomeScreen />
                </ThreadPrimitive.Empty>

                <ThreadPrimitive.Messages
                    components={{
                        UserMessage,
                        AssistantMessage,
                    }}
                />

                <ScrollToBottomButton />
            </ThreadPrimitive.Viewport>

            <Composer />
        </ThreadPrimitive.Root>
    )
}
