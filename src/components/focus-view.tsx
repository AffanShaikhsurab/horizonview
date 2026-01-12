'use client'

import Link from 'next/link'
import type { MissionWithProjects, Project } from '@/types/database'

interface FocusViewProps {
    missions: MissionWithProjects[]
}

// Calculate focus metrics - REUSED LOGIC
function calculateFocusMetrics(missions: MissionWithProjects[]) {
    const allProjects = missions.flatMap(m => m.projects)
    const activeProjects = allProjects.filter(p => p.status === 'Active')
    const totalProjects = allProjects.length

    const energyPerProject = 20
    const usedEnergy = activeProjects.length * energyPerProject
    const remainingEnergy = Math.max(0, 100 - usedEnergy)

    let focusScore = remainingEnergy

    const avgProgress = activeProjects.length > 0
        ? activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length
        : 0
    focusScore = Math.min(100, focusScore + (avgProgress * 0.2))

    const activeMissionCount = missions.filter(m =>
        m.projects.some(p => p.status === 'Active')
    ).length
    if (activeMissionCount > 2) {
        focusScore = Math.max(0, focusScore - (activeMissionCount - 2) * 10)
    }

    return {
        focusScore: Math.round(focusScore),
        totalProjects,
        activeProjects: activeProjects.length,
        usedEnergy,
        remainingEnergy,
        activeMissionCount,
        avgProgress: Math.round(avgProgress)
    }
}

function getMissionMetrics(mission: MissionWithProjects) {
    const active = mission.projects.filter(p => p.status === 'Active')
    const concepts = mission.projects.filter(p => p.status === 'Concept')
    const archived = mission.projects.filter(p => p.status === 'Archived')
    const maintenance = mission.projects.filter(p => p.status === 'Maintenance')

    const energyUsed = active.length * 20
    const avgProgress = active.length > 0
        ? Math.round(active.reduce((sum, p) => sum + p.progress, 0) / active.length)
        : 0

    return { active, concepts, archived, maintenance, energyUsed, avgProgress }
}

function getHealthLabel(score: number): { label: string; color: string } {
    if (score >= 70) return { label: 'FOCUSED', color: '#10b981' }
    if (score >= 40) return { label: 'BALANCED', color: '#f59e0b' }
    return { label: 'SCATTERED', color: '#ef4444' }
}

function getStatusClass(status: Project['status']) {
    return `status-${status.toLowerCase()}`
}

export function FocusView({ missions }: FocusViewProps) {
    const metrics = calculateFocusMetrics(missions)
    const health = getHealthLabel(metrics.focusScore)

    return (
        <div className="focus-page-container">
            {/* Hero Section */}
            <div className="focus-hero">
                <div className="focus-hero-content">
                    <div className="focus-ring-large" style={{ borderColor: health.color, boxShadow: `0 0 60px ${health.color}20` }}>
                        <span className="value" style={{ color: health.color }}>{metrics.focusScore}</span>
                        <span className="label" style={{ color: health.color }}>{health.label}</span>
                    </div>

                    <div className="focus-hero-stats">
                        <div className="flex items-center gap-4 mb-2">
                            <Link href="/" className="back-link">
                                ← Back to Dashboard
                            </Link>
                        </div>
                        <h1 className="focus-hero-title">Mission Alignment</h1>
                        <p className="focus-hero-description">
                            You are currently using <strong>{metrics.usedEnergy}%</strong> of your mission energy across <strong>{metrics.activeMissionCount}</strong> active missions.
                            {metrics.activeMissionCount > 2 && " Consider narrowing your focus."}
                        </p>

                        <div className="stat-grid">
                            <div className="stat-item">
                                <div className="stat-icon">⚡</div>
                                <h4>Active Projects</h4>
                                <div className="stat-value">{metrics.activeProjects}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">📊</div>
                                <h4>Total Projects</h4>
                                <div className="stat-value">{metrics.totalProjects}</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-icon">📈</div>
                                <h4>Avg Progress</h4>
                                <div className="stat-value">{metrics.avgProgress}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Content */}
            <div className="focus-main-content">
                <div className="focus-grid">
                    {missions.map(mission => {
                        const mMetrics = getMissionMetrics(mission)
                        const hasActivity = mMetrics.active.length > 0

                        return (
                            <div
                                key={mission.id}
                                className="mission-card-large"
                                style={{ borderColor: hasActivity ? mission.color : 'var(--border)' }}
                            >
                                <div className="mission-card-header">
                                    <h3 className="mission-card-title" style={{ color: mission.color }}>{mission.title}</h3>
                                    <p className="mission-card-statement">{mission.statement}</p>

                                    {hasActivity && (
                                        <div className="mission-energy-bar">
                                            <div
                                                className="mission-energy-fill"
                                                style={{ width: `${mMetrics.energyUsed}%`, background: mission.color }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mission-card-body">
                                    <div className="mission-summary mb-4">
                                        <span className={hasActivity ? 'text-white font-bold' : ''}>{mMetrics.active.length} Active</span>
                                        <span>{mMetrics.concepts.length} Concept</span>
                                    </div>

                                    {mission.projects.length > 0 ? (
                                        <div className="project-list-mini">
                                            {mission.projects.slice(0, 5).map(project => (
                                                <div key={project.id} className="project-mini">
                                                    <span className={`status-dot ${getStatusClass(project.status)}`} />
                                                    <span className="project-mini-title">{project.title}</span>
                                                    {project.status === 'Active' && (
                                                        <span className="project-mini-progress">{project.progress}%</span>
                                                    )}
                                                </div>
                                            ))}
                                            {mission.projects.length > 5 && (
                                                <div className="text-xs text-dim mt-2">
                                                    + {mission.projects.length - 5} more projects
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="no-projects">No projects yet</p>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
