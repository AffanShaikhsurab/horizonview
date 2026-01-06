'use client'

import { useState } from 'react'
import { useAISettings } from '@/hooks/use-ai-settings'

interface CommandBarProps {
    onCommand?: (command: string) => void
}

export function CommandBar({ onCommand }: CommandBarProps) {
    const [input, setInput] = useState('')
    const [feedback, setFeedback] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const { hasAnyProvider } = useAISettings()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        if (onCommand) {
            onCommand(input)
        }

        // Set some temporary feedback
        setFeedback(`Processing: "${input}"`)
        setIsVisible(true)
        setInput('')

        setTimeout(() => {
            setIsVisible(false)
            setTimeout(() => setFeedback(null), 300)
        }, 3000)
    }

    return (
        <div className="ai-dock">
            <div className={`ai-feedback ${isVisible ? 'visible' : ''}`}>
                {feedback}
            </div>

            <form className="command-bar" onSubmit={handleSubmit}>
                <button type="button" className="mic-btn" title="Voice command (AI)">
                    {hasAnyProvider ? '✨' : '🎤'}
                </button>
                <input
                    type="text"
                    className="cmd-input"
                    placeholder="Add project, archive, or analyze status..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </form>

            <div className="command-hints">
                <span className="hint-item">Try: &quot;import github&quot;</span>
                <span className="hint-divider">•</span>
                <span className="hint-item">&quot;new mission&quot;</span>
                <span className="hint-divider">•</span>
                <span className="hint-item">&quot;ai settings&quot;</span>
            </div>
        </div>
    )
}
