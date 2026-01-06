'use client'

import type { Project } from '@/types/database'

interface ProjectCardProps {
    project: Project
    missionColor: string
    onArchive?: (id: string) => void
    onEdit?: (project: Project) => void
}

export function ProjectCard({ project, missionColor, onArchive, onEdit }: ProjectCardProps) {
    const getStatusClass = (status: Project['status']) => {
        return `status-tag status-${status.toLowerCase()}`
    }

    return (
        <div className="project-card" onClick={() => onEdit?.(project)}>
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
