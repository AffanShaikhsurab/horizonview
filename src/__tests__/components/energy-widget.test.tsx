import React from 'react'
import { render, screen } from '@testing-library/react'
import { EnergyWidget } from '@/components/energy-widget'
import type { Project } from '@/types/database'

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

describe('EnergyWidget', () => {
    it('should render with 100% energy when no projects', () => {
        render(<EnergyWidget projects={[]} />)
        expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should render with reduced energy for active projects', () => {
        const projects = [mockProject('Active')]
        render(<EnergyWidget projects={projects} />)
        expect(screen.getByText('80%')).toBeInTheDocument()
    })

    it('should show Focus Budget label', () => {
        render(<EnergyWidget projects={[]} />)
        expect(screen.getByText('Focus Budget')).toBeInTheDocument()
    })

    it('should have correct width on energy bar', () => {
        const projects = [mockProject('Active'), mockProject('Active')]
        render(<EnergyWidget projects={projects} />)
        
        const energyFill = document.querySelector('.energy-fill')
        expect(energyFill).toHaveStyle({ width: '60%' })
    })

    it('should not reduce energy for archived projects', () => {
        const projects = [mockProject('Archived'), mockProject('Archived')]
        render(<EnergyWidget projects={projects} />)
        expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('should display minimum 5% even with many active projects', () => {
        const projects = Array(10).fill(null).map(() => mockProject('Active'))
        render(<EnergyWidget projects={projects} />)
        expect(screen.getByText('5%')).toBeInTheDocument()
    })
})
