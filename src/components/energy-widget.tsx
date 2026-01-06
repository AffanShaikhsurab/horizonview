'use client'

import { calculateFocusBudget, getEnergyColor } from '@/hooks/use-horizon'
import type { Project } from '@/types/database'

interface EnergyWidgetProps {
    projects: Project[]
}

export function EnergyWidget({ projects }: EnergyWidgetProps) {
    const energy = calculateFocusBudget(projects)
    const color = getEnergyColor(energy)

    return (
        <div className="energy-widget">
            <span className="energy-label">Focus Budget</span>
            <div className="energy-bar-container">
                <div
                    className="energy-fill"
                    style={{
                        width: `${energy}%`,
                        backgroundColor: color
                    }}
                />
            </div>
            <span style={{ color, fontWeight: 'bold', fontSize: '0.9rem', minWidth: '40px' }}>
                {energy}%
            </span>
        </div>
    )
}
