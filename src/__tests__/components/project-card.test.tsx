import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProjectCard } from '@/components/project-card'
import type { Project } from '@/types/database'

// Create a new QueryClient for each test
const createTestQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
})

const renderWithProviders = (ui: React.ReactElement) => {
    const testQueryClient = createTestQueryClient()
    return render(
        <QueryClientProvider client={testQueryClient}>
            {ui}
        </QueryClientProvider>
    )
}

const mockProject: Project = {
    id: 'project-1',
    mission_id: 'mission-1',
    title: 'Test Project',
    status: 'Active',
    progress: 75,
    type: 'Tool',
    description: 'A test project description',
    github_url: 'https://github.com/test/project',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'user-id',
}

const defaultMissionColor = '#3B82F6'

describe('ProjectCard', () => {
    it('should render project title', () => {
        renderWithProviders(
            <ProjectCard project={mockProject} missionColor={defaultMissionColor} onEdit={jest.fn()} />
        )
        expect(screen.getByText('Test Project')).toBeInTheDocument()
    })

    it('should render project status badge', () => {
        renderWithProviders(
            <ProjectCard project={mockProject} missionColor={defaultMissionColor} onEdit={jest.fn()} />
        )
        expect(screen.getByText('Active')).toBeInTheDocument()
    })

    it('should render project type', () => {
        renderWithProviders(
            <ProjectCard project={mockProject} missionColor={defaultMissionColor} onEdit={jest.fn()} />
        )
        expect(screen.getByText('Tool')).toBeInTheDocument()
    })

    it('should render progress bar', () => {
        renderWithProviders(
            <ProjectCard project={mockProject} missionColor={defaultMissionColor} onEdit={jest.fn()} />
        )
        expect(screen.getByText('75%')).toBeInTheDocument()
    })

    it('should call onEdit when card is clicked', () => {
        const onEdit = jest.fn()
        renderWithProviders(
            <ProjectCard project={mockProject} missionColor={defaultMissionColor} onEdit={onEdit} />
        )

        const card = document.querySelector('.project-card')
        fireEvent.click(card!)
        expect(onEdit).toHaveBeenCalledWith(mockProject)
    })

    it('should render GitHub link when github_url is provided', () => {
        renderWithProviders(
            <ProjectCard project={mockProject} missionColor={defaultMissionColor} onEdit={jest.fn()} />
        )

        const githubLink = screen.queryByText('GitHub')
        expect(githubLink).toBeInTheDocument()
    })

    it('should not render GitHub link when github_url is null', () => {
        const projectWithoutGithub = { ...mockProject, github_url: null }
        renderWithProviders(
            <ProjectCard project={projectWithoutGithub} missionColor={defaultMissionColor} onEdit={jest.fn()} />
        )

        const githubLink = screen.queryByText('GitHub')
        expect(githubLink).not.toBeInTheDocument()
    })

    it('should render archive button for non-archived projects', () => {
        const onArchive = jest.fn()
        renderWithProviders(
            <ProjectCard 
                project={mockProject} 
                missionColor={defaultMissionColor} 
                onEdit={jest.fn()} 
                onArchive={onArchive}
            />
        )
        
        expect(screen.getByTitle('Archive project')).toBeInTheDocument()
    })

    it('should not render archive button for archived projects', () => {
        const archivedProject = { ...mockProject, status: 'Archived' as const }
        renderWithProviders(
            <ProjectCard 
                project={archivedProject} 
                missionColor={defaultMissionColor} 
                onEdit={jest.fn()} 
                onArchive={jest.fn()}
            />
        )
        
        expect(screen.queryByTitle('Archive project')).not.toBeInTheDocument()
    })
})
