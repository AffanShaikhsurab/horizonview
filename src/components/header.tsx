'use client'

import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { EnergyWidget } from './energy-widget'
import type { Project } from '@/types/database'

interface HeaderProps {
    projects: Project[]
    hideFocusBtn?: boolean
    onImportClick?: () => void
    onNewMissionClick?: () => void
}

export function Header({ projects, hideFocusBtn = false, onImportClick, onNewMissionClick }: HeaderProps) {
    return (
        <header className="header">
            <div className="logo">
                <Link href="/">
                    HORIZON <span>OS</span>
                </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <EnergyWidget projects={projects} />

                {onImportClick && (
                    <button className="focus-btn" onClick={onImportClick} title="Import from GitHub">
                        <span>📥</span> Import
                    </button>
                )}

                {onNewMissionClick && (
                    <button className="focus-btn" onClick={onNewMissionClick} title="Create New Mission">
                        <span>➕</span> New Mission
                    </button>
                )}

                {!hideFocusBtn && (
                    <Link href="/focus" className="focus-btn">
                        <span>🎯</span> Focus Analysis
                    </Link>
                )}

                <UserButton afterSignOutUrl="/" />
            </div>
        </header>
    )
}
