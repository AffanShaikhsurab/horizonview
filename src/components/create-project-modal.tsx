'use client'

import { useState } from 'react'
import { useCreateProject } from '@/hooks/use-horizon'
import type { ProjectType } from '@/types/database'

interface CreateProjectModalProps {
    missionId: string
    isOpen: boolean
    onClose: () => void
}

const PROJECT_TYPES: ProjectType[] = ['Tool', 'Platform', 'Research', 'AI Agent', 'Analytics', 'Experiment', 'Other']

export function CreateProjectModal({ missionId, isOpen, onClose }: CreateProjectModalProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [type, setType] = useState<ProjectType>('Tool')
    const createProject = useCreateProject()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createProject.mutateAsync({
                mission_id: missionId,
                title,
                description,
                type,
                status: 'Active',
                progress: 0
            })
            onClose()
            setTitle('')
            setDescription('')
        } catch (error) {
            console.error('Failed to create project:', error)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Project</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Project Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What are you building?"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Briefly describe the vision..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Project Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as ProjectType)}
                        >
                            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="modal-actions">
                        <div className="modal-actions-right" style={{ marginLeft: 'auto' }}>
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save" disabled={createProject.isPending}>
                                {createProject.isPending ? 'Creating...' : 'Launch Project'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
