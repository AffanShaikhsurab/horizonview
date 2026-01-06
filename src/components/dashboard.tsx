'use client'

import { useState } from 'react'
import { useMissionsWithProjects } from '@/hooks/use-horizon'
import { Header } from './header'
import { HorizonGrid } from './horizon-grid'
import { CommandBar } from './command-bar'
import { ProjectModal } from './project-modal'
import { CreateProjectModal } from './create-project-modal'
import { CreateMissionModal } from './create-mission-modal'
import { AISettings } from './ai-settings'
import { GitHubImportModal } from './github-import-modal'
import type { Project } from '@/types/database'

export function Dashboard() {
    const { data: missions, isLoading, error } = useMissionsWithProjects()
    const [editingProject, setEditingProject] = useState<Project | null>(null)
    const [addingToMissionId, setAddingToMissionId] = useState<string | null>(null)
    const [isNewMissionModalOpen, setIsNewMissionModalOpen] = useState(false)
    const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false)
    const [isAISettingsOpen, setIsAISettingsOpen] = useState(false)

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Initializing Horizon OS...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>System Error</h2>
                <p>{error instanceof Error ? error.message : 'Failed to synchronize with horizon'}</p>
                <button className="btn-save" style={{ marginTop: '20px' }} onClick={() => window.location.reload()}>
                    Retry Link
                </button>
            </div>
        )
    }

    const allProjects = missions?.flatMap((m) => m.projects) ?? []

    return (
        <div className="app-container">
            <Header 
                projects={allProjects}
                onImportClick={() => setIsGitHubModalOpen(true)}
                onNewMissionClick={() => setIsNewMissionModalOpen(true)}
            />

            <HorizonGrid
                missions={missions ?? []}
                onEditProject={setEditingProject}
                onAddProject={setAddingToMissionId}
            />

            <CommandBar
                onCommand={(cmd) => {
                    const lower = cmd.toLowerCase()
                    if (lower.includes('github') || lower.includes('import')) {
                        setIsGitHubModalOpen(true)
                    } else if (lower.includes('settings') || lower.includes('ai')) {
                        setIsAISettingsOpen(true)
                    } else if (lower.includes('mission') && (lower.includes('add') || lower.includes('new') || lower.includes('create'))) {
                        setIsNewMissionModalOpen(true)
                    }
                }}
            />

            {editingProject && (
                <ProjectModal
                    project={editingProject}
                    isOpen={true}
                    onClose={() => setEditingProject(null)}
                />
            )}

            {addingToMissionId && (
                <CreateProjectModal
                    missionId={addingToMissionId}
                    isOpen={true}
                    onClose={() => setAddingToMissionId(null)}
                />
            )}

            <CreateMissionModal
                isOpen={isNewMissionModalOpen}
                onClose={() => setIsNewMissionModalOpen(false)}
            />

            <GitHubImportModal
                isOpen={isGitHubModalOpen}
                onClose={() => setIsGitHubModalOpen(false)}
            />

            <AISettings
                isOpen={isAISettingsOpen}
                onClose={() => setIsAISettingsOpen(false)}
            />
        </div>
    )
}
