'use client'

import { useState, useEffect, useRef } from 'react'
import { useAISettings } from '@/hooks/use-ai-settings'

interface AISettingsProps {
    isOpen: boolean
    onClose: () => void
}

export function AISettings({ isOpen, onClose }: AISettingsProps) {
    const { config, saveKeys, clearKeys } = useAISettings()
    const [geminiKey, setGeminiKey] = useState(config.geminiApiKey || '')
    const [groqKey, setGroqKey] = useState(config.groqApiKey || '')
    const prevConfigRef = useRef(config)

    // Sync state when config changes (e.g., after load from localStorage)
    useEffect(() => {
        if (prevConfigRef.current.geminiApiKey !== config.geminiApiKey ||
            prevConfigRef.current.groqApiKey !== config.groqApiKey) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setGeminiKey(config.geminiApiKey || '')
            setGroqKey(config.groqApiKey || '')
            prevConfigRef.current = config
        }
    }, [config])

    if (!isOpen) return null

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault()
        saveKeys(geminiKey, groqKey)
        onClose()
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>AI Processor Settings</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSave}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
                        API keys are stored locally in your browser.
                    </p>

                    <div className="form-group">
                        <label>Google Gemini API Key</label>
                        <input
                            type="password"
                            value={geminiKey}
                            onChange={(e) => setGeminiKey(e.target.value)}
                            placeholder="Enter Gemini API Key..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Groq API Key</label>
                        <input
                            type="password"
                            value={groqKey}
                            onChange={(e) => setGroqKey(e.target.value)}
                            placeholder="Enter Groq API Key..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-delete" onClick={() => {
                            if (confirm('Clear all stored AI keys?')) {
                                clearKeys()
                                setGeminiKey('')
                                setGroqKey('')
                            }
                        }}>
                            Clear Keys
                        </button>
                        <div className="modal-actions-right">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save">
                                Save Settings
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
