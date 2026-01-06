'use client'

import { useState } from 'react'
import { useCreateMission } from '@/hooks/use-horizon'

interface CreateMissionModalProps {
    isOpen: boolean
    onClose: () => void
}

const MISSION_COLORS = [
    { name: 'Education', color: '#3b82f6' },
    { name: 'Startup', color: '#a855f7' },
    { name: 'Career', color: '#10b981' },
    { name: 'Personal', color: '#ef4444' },
    { name: 'Research', color: '#f59e0b' },
    { name: 'Other', color: '#6e6e6e' }
]

export function CreateMissionModal({ isOpen, onClose }: CreateMissionModalProps) {
    const [title, setTitle] = useState('')
    const [statement, setStatement] = useState('')
    const [color, setColor] = useState('#3b82f6')
    const createMission = useCreateMission()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createMission.mutateAsync({
                title,
                statement,
                color,
                order_index: 0
            })
            onClose()
            setTitle('')
            setStatement('')
        } catch (error) {
            console.error('Failed to create mission:', error)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Life Mission</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Mission Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Education, Startup, Health"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Mission Statement</label>
                        <textarea
                            value={statement}
                            onChange={(e) => setStatement(e.target.value)}
                            placeholder="What do you want to achieve in this vertical?"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Theme Color</label>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {MISSION_COLORS.map(c => (
                                <button
                                    key={c.color}
                                    type="button"
                                    onClick={() => setColor(c.color)}
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        borderRadius: '50%',
                                        backgroundColor: c.color,
                                        border: color === c.color ? '2px solid white' : 'none',
                                        cursor: 'pointer'
                                    }}
                                    title={c.name}
                                />
                            ))}
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{ width: '30px', height: '30px', padding: 0, border: 'none', background: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <div className="modal-actions-right" style={{ marginLeft: 'auto' }}>
                            <button type="button" className="btn-cancel" onClick={onClose}>
                                Cancel
                            </button>
                            <button type="submit" className="btn-save" disabled={createMission.isPending}>
                                {createMission.isPending ? 'Creating...' : 'Establish Mission'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
