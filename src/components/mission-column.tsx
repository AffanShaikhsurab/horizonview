'use client'

import { ProjectCard } from './project-card'
import type { MissionWithProjects, Project } from '@/types/database'

interface MissionColumnProps {
  mission: MissionWithProjects
  onArchiveProject?: (projectId: string, missionId: string) => void
  onEditProject?: (project: Project) => void
  onAddProject?: () => void
}

export function MissionColumn({ mission, onArchiveProject, onEditProject, onAddProject }: MissionColumnProps) {
  // Filter out archived projects from display
  const activeProjects = mission.projects.filter(p => p.status !== 'Archived')

  return (
    <div className="mission-column">
      <div
        className="mission-header"
        style={{ borderColor: mission.color }}
      >
        <div className="mission-header-top">
          <div className="mission-title">{mission.title}</div>
          {onAddProject && (
            <button
              className="btn-add-project"
              onClick={onAddProject}
              title="Add project"
              style={{ color: mission.color }}
            >
              +
            </button>
          )}
        </div>
        <div className="mission-statement">{mission.statement}</div>
      </div>

      {activeProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          missionColor={mission.color}
          onArchive={onArchiveProject ? (id) => onArchiveProject(id, mission.id) : undefined}
          onEdit={onEditProject}
        />
      ))}

      {activeProjects.length === 0 && (
        <div className="empty-column">
          <p>No active projects</p>
          {onAddProject && (
            <button className="btn-add-first" onClick={onAddProject}>
              + Add Project
            </button>
          )}
        </div>
      )}
    </div>
  )
}

