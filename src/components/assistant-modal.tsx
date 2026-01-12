'use client'

import { AssistantModalButton } from './assistant-ui/assistant-modal-button'

interface AssistantModalProps {
    isOpen?: boolean
    onClose?: () => void
    initialPrompt?: string | null
}

// Legacy wrapper for backward compatibility
// The new implementation uses a floating button pattern
export function AssistantModal({ isOpen, onClose, initialPrompt }: AssistantModalProps) {
    // For backward compatibility, we can still render the modal
    // But the new pattern is to use AssistantModalButton as a floating button
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content assistant-modal-large"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Horizon Assistant</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>
                <div className="assistant-modal-body">
                    {/* This imports the thread directly for legacy modal usage */}
                    <iframe
                        src="about:blank"
                        style={{ display: 'none' }}
                    />
                    <div className="assistant-no-provider-msg">
                        <p>Use the floating assistant button in the bottom-right corner for the best experience.</p>
                        <button
                            className="btn-cancel"
                            onClick={onClose}
                            style={{ marginTop: '16px' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Export the new floating button component
export { AssistantModalButton }
