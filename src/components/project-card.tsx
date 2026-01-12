'use client'

import type { Project } from '@/types/database'

interface ProjectCardProps {
    project: Project
    missionColor: string
    onArchive?: (id: string) => void
    onEdit?: (project: Project) => void
    onDragStart?: (e: React.DragEvent, project: Project) => void
}

export function ProjectCard({ project, missionColor, onArchive, onEdit, onDragStart }: ProjectCardProps) {
    const getStatusClass = (status: Project['status']) => {
        return `status-tag status-${status.toLowerCase()}`
    }

    const handleDragStart = (e: React.DragEvent) => {
        e.currentTarget.classList.add('dragging')
        e.dataTransfer.setData('application/horizon-project', project.id)
        e.dataTransfer.setData('text/plain', project.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart?.(e, project)
    }

    const handleDragEnd = (e: React.DragEvent) => {
        e.currentTarget.classList.remove('dragging')
    }

    return (
        <div
            className="project-card"
            onClick={(e) => {
                const el = e.currentTarget as HTMLDivElement
                if (el.classList.contains('dragging')) return
                onEdit?.(project)
            }}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="project-card-header">
                <span className={getStatusClass(project.status)}>{project.status}</span>
                {onArchive && project.status !== 'Archived' && (
                    <button
                        className="archive-btn"
                        onClick={(e) => {
                            e.stopPropagation()
                            onArchive(project.id)
                        }}
                        title="Archive project"
                    >
                        📦
                    </button>
                )}
            </div>

            <h3 className="project-title">{project.title}</h3>

            {project.description && (
                <p className="project-description">{project.description}</p>
            )}

            <div className="project-meta">
                <span>{project.type}</span>
                {project.github_url && (
                    <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link"
                        onClick={(e) => e.stopPropagation()}
                    >
                        GitHub
                    </a>
                )}
            </div>

            <div className="delta-container">
                <div className="delta-label">
                    <span>Vision Gap</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="delta-track">
                    <div
                        className="delta-bar"
                        style={{
                            width: `${project.progress}%`,
                            backgroundColor: missionColor
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
