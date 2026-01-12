'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAISettings } from '@/hooks/use-ai-settings'
import { useMissionsWithProjects } from '@/hooks/use-horizon'
import { getAIProvider } from '@/lib/ai-provider'

interface CommandBarProps {
    onCommand?: (command: string) => void
}

export function CommandBar({ onCommand }: CommandBarProps) {
    const router = useRouter()
    const escapeHtml = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
    const escapeAttr = (s: string) => s.replace(/"/g, '&quot;')
    const sanitizeUrl = (url: string): string | null => {
        const u = url.trim()
        if (/^(https?:\/\/|mailto:)/i.test(u) && !/^javascript:/i.test(u)) return u
        return null
    }
    const renderInline = (raw: string) => {
        const links: string[] = []
        const withLinks = raw.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, url) => {
            const safe = sanitizeUrl(String(url))
            const textEsc = escapeHtml(String(label))
            const anchor = safe
                ? `<a href="${escapeAttr(safe)}" target="_blank" rel="noopener noreferrer nofollow">${textEsc}</a>`
                : `${textEsc} (${escapeHtml(String(url))})`
            links.push(anchor)
            return `__LINK_${links.length - 1}__`
        })
        let line = escapeHtml(withLinks)
        line = line.replace(/__LINK_(\d+)__/g, (_m, i) => links[Number(i)] || '')
        line = line.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`)
        line = line.replace(/\*\*([^*]+)\*\*/g, (_m, c) => `<strong>${c}</strong>`)
        line = line.replace(/_([^_]+)_/g, (_m, c) => `<em>${c}</em>`)
        return line
    }
    const renderMarkdownSafe = (md: string) => {
        const lines = md.replace(/\r\n/g, '\n').split('\n')
        let html = ''
        let inCode = false
        let codeBuf = ''
        let inList = false
        for (const raw of lines) {
            if (raw.trim().startsWith('```')) {
                if (!inCode) {
                    inCode = true
                    codeBuf = ''
                } else {
                    inCode = false
                    html += `<pre><code>${escapeHtml(codeBuf)}</code></pre>`
                    codeBuf = ''
                }
                continue
            }
            if (inCode) {
                codeBuf += raw + '\n'
                continue
            }
            if (/^###\s+/.test(raw)) {
                if (inList) {
                    html += '</ul>'
                    inList = false
                }
                html += `<h3>${renderInline(raw.replace(/^###\s+/, ''))}</h3>`
                continue
            }
            if (/^##\s+/.test(raw)) {
                if (inList) {
                    html += '</ul>'
                    inList = false
                }
                html += `<h2>${renderInline(raw.replace(/^##\s+/, ''))}</h2>`
                continue
            }
            if (/^#\s+/.test(raw)) {
                if (inList) {
                    html += '</ul>'
                    inList = false
                }
                html += `<h1>${renderInline(raw.replace(/^#\s+/, ''))}</h1>`
                continue
            }
            if (/^(\-|\*)\s+/.test(raw)) {
                if (!inList) {
                    html += '<ul>'
                    inList = true
                }
                html += `<li>${renderInline(raw.replace(/^(\-|\*)\s+/, ''))}</li>`
                continue
            }
            if (inList) {
                html += '</ul>'
                inList = false
            }
            if (raw.trim().length === 0) {
                html += '<br/>'
                continue
            }
            html += `<p>${renderInline(raw)}</p>`
        }
        if (inList) html += '</ul>'
        if (inCode) html += `<pre><code>${escapeHtml(codeBuf)}</code></pre>`
        return html
    }
    const [input, setInput] = useState('')
    const [feedback, setFeedback] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const { hasAnyProvider, config } = useAISettings()
    const { data: missions } = useMissionsWithProjects()

    const analyzeProjects = async (text: string): Promise<string | null> => {
        const lower = text.toLowerCase()
        console.info('CommandBar: analyzeProjects input', { text })
        const intents = [
            'project',
            'projects',
            'working on',
            'what am i',
            'focus',
            'focus on',
            'should i focus',
            'what should i focus',
            'what should i focus on',
            'analyze',
            'analysis',
            'overview',
            'status'
        ]
        const isProjectQuery = intents.some(i => lower.includes(i))

        if (!isProjectQuery) {
            console.info('CommandBar: not a projects query, skipping analysis')
            return null
        }

        const allMissions = missions ?? []
        const allProjects = allMissions.flatMap(m => m.projects)
        const active = allProjects.filter(p => p.status === 'Active')
        const energyPerProject = 20
        const usedEnergy = active.length * energyPerProject
        const remainingEnergy = Math.max(0, 100 - usedEnergy)
        console.info('CommandBar: data snapshot', {
            missions: allMissions.length,
            projects: allProjects.length,
            active: active.length,
            remainingEnergy
        })

        const overview =
            allMissions.length === 0
                ? 'No missions found.'
                : allMissions
                    .map(m => {
                        const items = m.projects.map(p => {
                            const prog = p.status === 'Active' ? ` (${p.progress}%)` : ''
                            return `- ${p.title} [${p.status}]${prog}`
                        })
                        return `${m.title}:\n${items.join('\n') || '- No projects'}`
                    })
                    .join('\n\n')

        const focusAdvice =
            active.length <= 2
                ? 'Focus looks healthy. Keep priorities tight.'
                : 'Too many active projects. Reduce to one or two.'

        if (!hasAnyProvider) {
            const msg = [
                'No AI provider configured. Type "ai settings" to add keys.',
                `You have ${allProjects.length} projects across ${allMissions.length} missions.`,
                `Active: ${active.length}, Energy used: ${usedEnergy}%, Remaining: ${remainingEnergy}%`,
                focusAdvice,
                '',
                overview
            ].join('\n')
            console.warn('CommandBar: missing AI keys, showing local summary')
            return msg
        }

        const system =
            'You advise on project focus. Explain by mission, list projects with status and progress, and give focus guidance. Recommend 1–2 active projects max.'
        const prompt =
            [
                'Analyze current missions and projects.',
                `Energy rule: each active project uses ${energyPerProject}%. Remaining: ${remainingEnergy}%.`,
                `Overview:\n${overview}`,
                'Answer clearly for the user.'
            ].join('\n')

        const provider = getAIProvider(config)
        try {
            const response = await provider.generateCompletion([
                { role: 'system', content: system },
                { role: 'user', content: prompt }
            ])
            console.info('CommandBar: AI response received', {
                provider: response.provider,
                model: response.model,
                length: response.text.length
            })
            return [`Powered by ${response.provider} (${response.model})`, '', response.text].join('\n')
        } catch (error) {
            console.error('CommandBar: AI call failed, falling back', error)
            const msg = [
                'AI call failed, showing local summary.',
                `You have ${allProjects.length} projects across ${allMissions.length} missions.`,
                `Active: ${active.length}, Energy used: ${usedEnergy}%, Remaining: ${remainingEnergy}%`,
                focusAdvice,
                '',
                overview
            ].join('\n')
            return msg
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const lower = input.toLowerCase()
        console.info('CommandBar: submit', { input })
        
        const isProjectQuery = [
            'project',
            'projects',
            'working on',
            'what am i',
            'focus',
            'focus on',
            'should i focus',
            'what should i focus',
            'what should i focus on',
            'analyze',
            'analysis',
            'overview',
            'status'
        ].some(i => lower.includes(i))
        
        if (onCommand) {
            onCommand(input)
        }

        if (isProjectQuery) {
            setFeedback(`Processing: "${input}"`)
            setIsVisible(true)
            const ask = input
            setInput('')

            const analysis = await analyzeProjects(ask)
            if (analysis) {
                setFeedback(analysis)
                setIsVisible(true)
                console.info('CommandBar: analysis shown')
            } else {
                console.info('CommandBar: no analysis produced')
            }

            setTimeout(() => {
                setIsVisible(false)
                setTimeout(() => setFeedback(null), 500)
            }, analysis ? 6000 : 3000)
        } else {
            const query = input
            setInput('')
            router.push(`/chat?q=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div className="ai-dock">
            <div
                className={`ai-feedback ${isVisible ? 'visible' : ''}`}
                dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(feedback || '') }}
            />

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
