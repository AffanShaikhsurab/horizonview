import React from 'react'
import { render, screen } from '@testing-library/react'
import type { Project } from '@/types/database'

// Mock the components that depend on external services
jest.mock('@clerk/nextjs', () => ({
    UserButton: () => <button data-testid="user-button">User</button>,
}))

jest.mock('next/link', () => {
    const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    )
    MockLink.displayName = 'MockLink'
    return MockLink
})

// Import after mocks
import { Header } from '@/components/header'

const mockProject = (status: string): Project => ({
    id: 'test-id',
    mission_id: 'mission-id',
    title: 'Test Project',
    status: status as Project['status'],
    progress: 50,
    type: 'Tool',
    description: null,
    github_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-id',
})

describe('Header', () => {
    const defaultProjects: Project[] = []

    it('should render the logo with correct text', () => {
        render(<Header projects={defaultProjects} />)
        expect(screen.getByText('HORIZON')).toBeInTheDocument()
        expect(screen.getByText('OS')).toBeInTheDocument()
    })

    it('should render the EnergyWidget', () => {
        render(<Header projects={defaultProjects} />)
        expect(screen.getByText('Focus Budget')).toBeInTheDocument()
    })

    it('should render Focus Analysis link when hideFocusBtn is false', () => {
        render(<Header projects={defaultProjects} hideFocusBtn={false} />)
        expect(screen.getByText('Focus Analysis')).toBeInTheDocument()
    })

    it('should not render Focus Analysis link when hideFocusBtn is true', () => {
        render(<Header projects={defaultProjects} hideFocusBtn={true} />)
        expect(screen.queryByText('Focus Analysis')).not.toBeInTheDocument()
    })

    it('should render Import button when onImportClick is provided', () => {
        const onImportClick = jest.fn()
        render(<Header projects={defaultProjects} onImportClick={onImportClick} />)
        expect(screen.getByText('Import')).toBeInTheDocument()
    })

    it('should not render Import button when onImportClick is not provided', () => {
        render(<Header projects={defaultProjects} />)
        expect(screen.queryByText('Import')).not.toBeInTheDocument()
    })

    it('should render New Mission button when onNewMissionClick is provided', () => {
        const onNewMissionClick = jest.fn()
        render(<Header projects={defaultProjects} onNewMissionClick={onNewMissionClick} />)
        expect(screen.getByText('New Mission')).toBeInTheDocument()
    })

    it('should render UserButton from Clerk', () => {
        render(<Header projects={defaultProjects} />)
        expect(screen.getByTestId('user-button')).toBeInTheDocument()
    })

    it('should update energy based on active projects', () => {
        const projects = [mockProject('Active'), mockProject('Active')]
        render(<Header projects={projects} />)
        expect(screen.getByText('60%')).toBeInTheDocument()
    })
})
