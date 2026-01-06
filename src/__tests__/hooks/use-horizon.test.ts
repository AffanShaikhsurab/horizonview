import { calculateFocusBudget, getEnergyColor } from '@/hooks/use-horizon'
import type { Project } from '@/types/database'

describe('Focus Budget Utilities', () => {
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

    describe('calculateFocusBudget', () => {
        it('should return 100 when no projects are provided', () => {
            expect(calculateFocusBudget([])).toBe(100)
        })

        it('should return 100 when all projects are archived', () => {
            const projects = [
                mockProject('Archived'),
                mockProject('Archived'),
            ]
            expect(calculateFocusBudget(projects)).toBe(100)
        })

        it('should reduce budget for active projects', () => {
            const projects = [
                mockProject('Active'),
            ]
            const budget = calculateFocusBudget(projects)
            expect(budget).toBeLessThan(100)
        })

        it('should reduce budget more for multiple active projects', () => {
            const singleActive = calculateFocusBudget([mockProject('Active')])
            const multipleActive = calculateFocusBudget([
                mockProject('Active'),
                mockProject('Active'),
                mockProject('Active'),
            ])
            expect(multipleActive).toBeLessThan(singleActive)
        })

        it('should not reduce budget below 0', () => {
            const projects = Array(10).fill(null).map(() => mockProject('Active'))
            const budget = calculateFocusBudget(projects)
            expect(budget).toBeGreaterThanOrEqual(0)
        })
    })

    describe('getEnergyColor', () => {
        it('should return red for low energy (below 30%)', () => {
            expect(getEnergyColor(10)).toBe('#ef4444')
            expect(getEnergyColor(29)).toBe('#ef4444')
        })

        it('should return orange for medium energy (30-60%)', () => {
            expect(getEnergyColor(30)).toBe('#f59e0b')
            expect(getEnergyColor(45)).toBe('#f59e0b')
            expect(getEnergyColor(59)).toBe('#f59e0b')
        })

        it('should return white for high energy (above 60%)', () => {
            expect(getEnergyColor(60)).toBe('#ffffff')
            expect(getEnergyColor(100)).toBe('#ffffff')
        })
    })
})
