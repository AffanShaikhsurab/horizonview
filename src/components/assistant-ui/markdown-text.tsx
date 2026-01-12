'use client'

import '@assistant-ui/react-markdown/styles/dot.css'
import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown'
import remarkGfm from 'remark-gfm'
import { memo } from 'react'

const MarkdownTextImpl = () => {
    return (
        <MarkdownTextPrimitive
            remarkPlugins={[remarkGfm]}
            className="aui-markdown"
            components={{
                // Custom code block styling
                pre: ({ children, ...props }) => (
                    <pre className="aui-code-block" {...props}>
                        {children}
                    </pre>
                ),
                code: ({ children, className, ...props }) => {
                    // Inline code vs code blocks
                    const isInline = !className
                    return isInline ? (
                        <code className="aui-inline-code" {...props}>
                            {children}
                        </code>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    )
                },
                // Links open in new tab
                a: ({ children, href, ...props }) => (
                    <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aui-link"
                        {...props}
                    >
                        {children}
                    </a>
                ),
                // Tables
                table: ({ children, ...props }) => (
                    <div className="aui-table-wrapper">
                        <table className="aui-table" {...props}>
                            {children}
                        </table>
                    </div>
                ),
            }}
        />
    )
}

export const MarkdownText = memo(MarkdownTextImpl)
