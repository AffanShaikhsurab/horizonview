'use client'

import { FC, forwardRef } from 'react'
import { AssistantModalPrimitive } from '@assistant-ui/react'
import { Thread } from './thread'
import { BotIcon, XIcon, MessageCircleIcon } from 'lucide-react'

type ModalButtonProps = {
    'data-state'?: 'open' | 'closed'
}

const ModalButton = forwardRef<HTMLButtonElement, ModalButtonProps>(
    ({ 'data-state': state, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className="aui-modal-trigger"
                {...props}
            >
                {state === 'open' ? (
                    <XIcon className="size-6" />
                ) : (
                    <MessageCircleIcon className="size-6" />
                )}
                <span className="sr-only">
                    {state === 'open' ? 'Close Assistant' : 'Open Assistant'}
                </span>
            </button>
        )
    }
)
ModalButton.displayName = 'ModalButton'

export const AssistantModalButton: FC = () => {
    return (
        <AssistantModalPrimitive.Root>
            <AssistantModalPrimitive.Anchor className="aui-modal-anchor">
                <AssistantModalPrimitive.Trigger asChild>
                    <ModalButton />
                </AssistantModalPrimitive.Trigger>
            </AssistantModalPrimitive.Anchor>

            <AssistantModalPrimitive.Content
                className="aui-modal-content"
                sideOffset={16}
            >
                <div className="aui-modal-header">
                    <div className="aui-modal-header-icon">
                        <BotIcon className="size-5" />
                    </div>
                    <div className="aui-modal-header-text">
                        <h3 className="aui-modal-title">Horizon Assistant</h3>
                        <p className="aui-modal-subtitle">AI-powered productivity help</p>
                    </div>
                </div>
                <Thread />
            </AssistantModalPrimitive.Content>
        </AssistantModalPrimitive.Root>
    )
}
