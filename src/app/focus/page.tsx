'use client'

import { useMissionsWithProjects } from '@/hooks/use-horizon'
import { FocusView } from '@/components'
import { Header } from '@/components'

export default function FocusPage() {
    const { data: missions, isLoading } = useMissionsWithProjects()

    // We can show a simple loading state or the full layout with empty data
    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Analyzing mission alignment...</p>
            </div>
        )
    }

    const allProjects = missions?.flatMap(m => m.projects) ?? []

    return (
        <div className="app-container">
            {/* Reusing header but hiding the focus analysis button since we are already here */}
            <Header projects={allProjects} />
            <FocusView missions={missions ?? []} />
        </div>
    )
}
