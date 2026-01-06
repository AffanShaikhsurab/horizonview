'use client'

import { MissionColumn } from './mission-column'
import { useArchiveProject } from '@/hooks/use-horizon'
import type { MissionWithProjects, Project } from '@/types/database'

interface HorizonGridProps {
  missions: MissionWithProjects[]
  onEditProject?: (project: Project) => void
  onAddProject?: (missionId: string) => void
}

export function HorizonGrid({ missions, onEditProject, onAddProject }: HorizonGridProps) {
  const archiveProject = useArchiveProject()

  const handleArchive = async (projectId: string, missionId: string) => {
    try {
      await archiveProject.mutateAsync({ id: projectId, missionId })
    } catch (error) {
      console.error('Failed to archive project:', error)
    }
  }

  return (
    <main className="horizon-grid">
      {missions.map((mission) => (
        <MissionColumn
          key={mission.id}
          mission={mission}
          onArchiveProject={handleArchive}
          onEditProject={onEditProject}
          onAddProject={() => onAddProject?.(mission.id)}
        />
      ))}
    </main>
  )
}

