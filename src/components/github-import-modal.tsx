'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useMissionsWithProjects, useCreateProject } from '@/hooks/use-horizon'
import { useAISettings } from '@/hooks/use-ai-settings'
import { getAIProvider } from '@/lib/ai-provider'
import type { MissionWithProjects, ProjectType } from '@/types/database'

interface GitHubImportModalProps {
    isOpen: boolean
    onClose: () => void
}

interface GitHubRepo {
    id: number
    name: string
    full_name: string
    description: string | null
    html_url: string
    language: string | null
    pushed_at: string
    fork: boolean
    private: boolean
    stargazers_count: number
    topics: string[]
}

type ImportStep = 'auth' | 'loading' | 'select' | 'ai-suggest' | 'assign' | 'importing'

export function GitHubImportModal({ isOpen, onClose }: GitHubImportModalProps) {
    const { data: session, status: authStatus } = useSession()
    const [step, setStep] = useState<ImportStep>('auth')
    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [selectedRepos, setSelectedRepos] = useState<Set<number>>(new Set())
    const [repoMissions, setRepoMissions] = useState<Record<number, string>>({})
    const [error, setError] = useState<string | null>(null)
    const [importProgress, setImportProgress] = useState(0)
    const [aiLoading, setAiLoading] = useState(false)

    const { data: missions } = useMissionsWithProjects()
    const createProject = useCreateProject()
    const { config: aiConfig, hasAnyProvider } = useAISettings()

    if (!isOpen) return null

    const isAuthenticated = authStatus === 'authenticated' && session?.accessToken

    const fetchRepos = async () => {
        setStep('loading')
        setError(null)

        try {
            const headers: HeadersInit = {
                'Accept': 'application/vnd.github.v3+json',
            }

            // Use OAuth token for authenticated requests (includes private repos)
            if (session?.accessToken) {
                headers['Authorization'] = `Bearer ${session.accessToken}`
            }

            const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=pushed&affiliation=owner', {
                headers,
            })

            if (!response.ok) {
                throw new Error(response.status === 401 ? 'Authentication failed' : 'Failed to fetch repos')
            }

            const data: GitHubRepo[] = await response.json()

            // Filter: not forked, active in last 8 months
            const eightMonthsAgo = new Date()
            eightMonthsAgo.setMonth(eightMonthsAgo.getMonth() - 8)

            const filteredRepos = data.filter(repo => {
                if (repo.fork) return false
                const lastPush = new Date(repo.pushed_at)
                return lastPush >= eightMonthsAgo
            })

            setRepos(filteredRepos)
            setStep('select')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch repositories')
            setStep('auth')
        }
    }

    const toggleRepo = (repoId: number) => {
        setSelectedRepos(prev => {
            const next = new Set(prev)
            if (next.has(repoId)) {
                next.delete(repoId)
            } else {
                next.add(repoId)
            }
            return next
        })
    }

    const proceedToAISuggest = async () => {
        if (selectedRepos.size === 0 || !missions?.length) return

        // Check if AI is available
        if (!hasAnyProvider) {
            // Skip AI, go straight to manual assign
            proceedToManualAssign()
            return
        }

        setStep('ai-suggest')
        setAiLoading(true)

        try {
            const selectedReposList = repos.filter(r => selectedRepos.has(r.id))
            const suggestions = await categorizeWithAI(selectedReposList, missions)
            setRepoMissions(suggestions)
        } catch (err) {
            console.error('AI categorization failed:', err)
            // Fallback to first mission
            proceedToManualAssign()
            return
        }

        setAiLoading(false)
    }

    const categorizeWithAI = async (
        repoList: GitHubRepo[],
        missionList: MissionWithProjects[]
    ): Promise<Record<number, string>> => {
        const prompt = `You are categorizing GitHub repositories into missions.

MISSIONS:
${missionList.map(m => `- ${m.id}: "${m.title}" - ${m.statement}`).join('\n')}

REPOSITORIES:
${repoList.map(r => `- ${r.id}: "${r.name}" - ${r.description || 'No description'} (${r.language || 'Unknown'})`).join('\n')}

For each repository, determine which mission it best fits. Return ONLY a JSON object mapping repo IDs to mission IDs:
{"${repoList[0]?.id}": "${missionList[0]?.id}", ...}

Return only valid JSON, no explanation.`

        // Get AI provider with current API keys
        const provider = getAIProvider(aiConfig)

        const response = await provider.generateCompletion([{ role: 'user', content: prompt }])

        // Parse AI response
        const jsonMatch = response.text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            throw new Error('Invalid AI response')
        }

        const parsed = JSON.parse(jsonMatch[0])

        // Convert to proper format
        const result: Record<number, string> = {}
        for (const [repoId, missionId] of Object.entries(parsed)) {
            result[Number(repoId)] = String(missionId)
        }

        return result
    }

    const proceedToManualAssign = () => {
        const initialMissions: Record<number, string> = {}
        selectedRepos.forEach(id => {
            initialMissions[id] = missions?.[0]?.id || ''
        })
        setRepoMissions(initialMissions)
        setStep('assign')
    }

    const guessProjectType = (repo: GitHubRepo): ProjectType => {
        const name = repo.name.toLowerCase()
        const desc = (repo.description || '').toLowerCase()
        const topics = repo.topics.join(' ').toLowerCase()
        const combined = `${name} ${desc} ${topics}`

        if (combined.includes('ai') || combined.includes('ml') || combined.includes('agent')) return 'AI Agent'
        if (combined.includes('analytics') || combined.includes('dashboard')) return 'Analytics'
        if (combined.includes('api') || combined.includes('platform') || combined.includes('saas')) return 'Platform'
        if (combined.includes('tool') || combined.includes('cli') || combined.includes('utility')) return 'Tool'
        if (combined.includes('research') || combined.includes('paper')) return 'Research'
        return 'Experiment'
    }

    const importProjects = async () => {
        setStep('importing')
        setImportProgress(0)

        const selectedReposList = repos.filter(r => selectedRepos.has(r.id))
        let processed = 0

        for (const repo of selectedReposList) {
            const missionId = repoMissions[repo.id]
            if (!missionId) continue

            try {
                await createProject.mutateAsync({
                    mission_id: missionId,
                    title: repo.name,
                    description: repo.description || `Imported from GitHub`,
                    status: 'Active',
                    type: guessProjectType(repo),
                    progress: 0,
                    github_url: repo.html_url,
                })
            } catch (err) {
                console.error(`Failed to import ${repo.name}:`, err)
            }

            processed++
            setImportProgress(Math.round((processed / selectedReposList.length) * 100))
        }

        setTimeout(() => {
            resetModal()
            onClose()
        }, 1000)
    }

    const resetModal = () => {
        setStep('auth')
        setRepos([])
        setSelectedRepos(new Set())
        setRepoMissions({})
        setError(null)
        setImportProgress(0)
        setAiLoading(false)
    }

    const handleClose = () => {
        resetModal()
        onClose()
    }

    // Helper function to get mission name by ID
    const getMissionName = (missionId: string): string => {
        const mission = missions?.find(m => m.id === missionId)
        return mission?.title || 'Unknown'
    }
    
    // Use getMissionName to avoid unused warning (can be used in UI if needed)
    void getMissionName

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content github-import-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Import from GitHub</h2>
                    <button className="modal-close" onClick={handleClose}>×</button>
                </div>

                {/* Step 1: Auth */}
                {step === 'auth' && (
                    <div className="github-step">
                        <p className="step-description">
                            Connect your GitHub account to import repositories (including private ones).
                        </p>

                        {isAuthenticated ? (
                            <div className="github-connected">
                                <div className="connected-status">✓ Connected to GitHub</div>
                                <p className="connected-hint">Ready to fetch your repositories including private ones.</p>
                            </div>
                        ) : (
                            <button className="github-login-btn" onClick={() => signIn('github')}>
                                🐙 Connect GitHub Account
                            </button>
                        )}

                        {error && <div className="github-error">{error}</div>}

                        <div className="modal-actions">
                            <div className="modal-actions-right">
                                <button className="btn-cancel" onClick={handleClose}>Cancel</button>
                                <button
                                    className="btn-save"
                                    onClick={fetchRepos}
                                    disabled={!isAuthenticated}
                                >
                                    Fetch Repos
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Loading */}
                {step === 'loading' && (
                    <div className="github-step github-loading">
                        <div className="loading-spinner" />
                        <p>Fetching repositories (including private)...</p>
                    </div>
                )}

                {/* Step 3: Select repos */}
                {step === 'select' && (
                    <div className="github-step">
                        <p className="step-description">
                            Found {repos.length} repos ({repos.filter(r => r.private).length} private). Select to import:
                        </p>
                        <div className="repo-list">
                            {repos.map(repo => (
                                <div
                                    key={repo.id}
                                    className={`repo-item ${selectedRepos.has(repo.id) ? 'selected' : ''}`}
                                    onClick={() => toggleRepo(repo.id)}
                                >
                                    <div className="repo-checkbox">
                                        {selectedRepos.has(repo.id) ? '✓' : ''}
                                    </div>
                                    <div className="repo-info">
                                        <div className="repo-name">
                                            {repo.name}
                                            {repo.private && <span className="repo-private">🔒</span>}
                                        </div>
                                        <div className="repo-meta">
                                            {repo.language && <span className="repo-lang">{repo.language}</span>}
                                            <span className="repo-stars">★ {repo.stargazers_count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {repos.length === 0 && (
                                <p className="no-repos">No active repositories found.</p>
                            )}
                        </div>
                        <div className="modal-actions">
                            <div className="modal-actions-left">
                                <button className="btn-cancel" onClick={() => setStep('auth')}>Back</button>
                            </div>
                            <div className="modal-actions-right">
                                <button
                                    className="btn-save"
                                    onClick={proceedToAISuggest}
                                    disabled={selectedRepos.size === 0}
                                >
                                    {hasAnyProvider ? '✨ AI Suggest Missions' : 'Assign Missions'} ({selectedRepos.size})
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: AI Suggesting */}
                {step === 'ai-suggest' && aiLoading && (
                    <div className="github-step github-loading">
                        <div className="loading-spinner" />
                        <p>🤖 AI analyzing repositories...</p>
                    </div>
                )}

                {/* Step 5: Assign to missions (with AI suggestions) */}
                {step === 'ai-suggest' && !aiLoading && (
                    <div className="github-step">
                        <p className="step-description">
                            ✨ AI suggested missions for each repo. Review and adjust:
                        </p>
                        <div className="assign-list">
                            {repos.filter(r => selectedRepos.has(r.id)).map(repo => (
                                <div key={repo.id} className="assign-item">
                                    <div className="assign-repo">
                                        {repo.name}
                                        {repo.private && <span className="repo-private">🔒</span>}
                                    </div>
                                    <select
                                        value={repoMissions[repo.id] || ''}
                                        onChange={(e) => setRepoMissions(prev => ({
                                            ...prev,
                                            [repo.id]: e.target.value
                                        }))}
                                    >
                                        {missions?.map((mission: MissionWithProjects) => (
                                            <option key={mission.id} value={mission.id}>
                                                {mission.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <div className="modal-actions-left">
                                <button className="btn-cancel" onClick={() => setStep('select')}>Back</button>
                            </div>
                            <div className="modal-actions-right">
                                <button className="btn-save" onClick={importProjects}>
                                    Import {selectedRepos.size} Projects
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Manual assign (when no AI) */}
                {step === 'assign' && (
                    <div className="github-step">
                        <p className="step-description">
                            Assign each repository to a mission:
                        </p>
                        <div className="assign-list">
                            {repos.filter(r => selectedRepos.has(r.id)).map(repo => (
                                <div key={repo.id} className="assign-item">
                                    <div className="assign-repo">
                                        {repo.name}
                                        {repo.private && <span className="repo-private">🔒</span>}
                                    </div>
                                    <select
                                        value={repoMissions[repo.id] || ''}
                                        onChange={(e) => setRepoMissions(prev => ({
                                            ...prev,
                                            [repo.id]: e.target.value
                                        }))}
                                    >
                                        {missions?.map((mission: MissionWithProjects) => (
                                            <option key={mission.id} value={mission.id}>
                                                {mission.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <div className="modal-actions-left">
                                <button className="btn-cancel" onClick={() => setStep('select')}>Back</button>
                            </div>
                            <div className="modal-actions-right">
                                <button className="btn-save" onClick={importProjects}>
                                    Import {selectedRepos.size} Projects
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Importing */}
                {step === 'importing' && (
                    <div className="github-step github-loading">
                        <div className="import-progress">
                            <div className="progress-bar" style={{ width: `${importProgress}%` }} />
                        </div>
                        <p>Importing projects... {importProgress}%</p>
                    </div>
                )}
            </div>
        </div>
    )
}
