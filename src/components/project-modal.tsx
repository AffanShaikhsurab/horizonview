'use client'

import { useState, useEffect } from 'react'
import { useUpdateProject, useDeleteProject } from '@/hooks/use-horizon'
import type { Project, ProjectStatus, ProjectType } from '@/types/database'

interface ProjectModalProps {
    project: Project
    isOpen: boolean
    onClose: () => void
}

const PROJECT_STATUSES: ProjectStatus[] = ['Active', 'Concept', 'Maintenance', 'Archived']
const PROJECT_TYPES: ProjectType[] = ['Tool', 'Platform', 'Research', 'AI Agent', 'Analytics', 'Experiment', 'Other']

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const [formData, setFormData] = useState<Partial<Project>>(project)
    const updateProject = useUpdateProject()
    const deleteProject = useDeleteProject()

    useEffect(() => {
        setFormData(project)
    }, [project])

    if (!isOpen) return null

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await updateProject.mutateAsync({
                id: project.id,
                ...formData
            })
            onClose()
        } catch (error) {
            console.error('Failed to update project:', error)
        }
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject.mutateAsync({ id: project.id, missionId: project.mission_id })
                onClose()
            } catch (error) {
                console.error('Failed to delete project:', error)
            }
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit Project</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSave}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.title || ''}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                            >
                                {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as ProjectType })}
                            >
                                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Progress (Vision Gap): {formData.progress}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.progress}
                            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className="form-group">
                        <label>GitHub URL</label>
                        <input
                            type="url"
                            value={formData.github_url || ''}
                            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                            placeholder="https://github.com/..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-delete" onClick={handleDelete}>
                            Delete Project
                        </button>
                        <div className="modal-actions-right">
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save" disabled={updateProject.isPending}>
                                {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
