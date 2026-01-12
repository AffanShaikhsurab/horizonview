'use client'

import { MissionColumn } from './mission-column'
import { useArchiveProject, useUpdateProject } from '@/hooks/use-horizon'
import type { MissionWithProjects, Project } from '@/types/database'

interface HorizonGridProps {
  missions: MissionWithProjects[]
  onEditProject?: (project: Project) => void
  onAddProject?: (missionId: string) => void
}

export function HorizonGrid({ missions, onEditProject, onAddProject }: HorizonGridProps) {
  const archiveProject = useArchiveProject()
  const updateProject = useUpdateProject()

  const handleArchive = async (projectId: string, missionId: string) => {
    try {
      await archiveProject.mutateAsync({ id: projectId, missionId })
    } catch (error) {
      console.error('Failed to archive project:', error)
    }
  }

  const handleDropProject = async (projectId: string, targetMissionId: string) => {
    try {
      const currentMissionId =
        missions.find(m => m.projects.some(p => p.id === projectId))?.id
      if (currentMissionId === targetMissionId) return
      await updateProject.mutateAsync({ id: projectId, mission_id: targetMissionId })
    } catch (error) {
      console.error('Failed to move project:', error)
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
          onDropProject={handleDropProject}
        />
      ))}
    </main>
  )
}

