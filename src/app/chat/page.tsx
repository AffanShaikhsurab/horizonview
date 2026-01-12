'use client'

import { Suspense } from 'react'
import { ChatInterface } from '@/components/chat/chat-interface'

function ChatPageContent() {
    return <ChatInterface />
}

export default function ChatPage() {
    return (
        <>
            <a href="#chat-main" className="skip-to-content">
                Skip to chat
            </a>
            <Suspense fallback={<div className="chat-container">Loading...</div>}>
                <ChatPageContent />
            </Suspense>
        </>
    )
}
