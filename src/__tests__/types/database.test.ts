import type {
    Mission,
    MissionInsert,
    Project,
    ProjectInsert,
    ProjectStatus,
    ProjectType,
    MissionWithProjects
} from '@/types/database'

describe('Database Types', () => {
    describe('Project Status', () => {
        const validStatuses: ProjectStatus[] = ['Active', 'Concept', 'Maintenance', 'Archived']
        
        it('should have all expected project statuses', () => {
            expect(validStatuses).toContain('Active')
            expect(validStatuses).toContain('Concept')
            expect(validStatuses).toContain('Maintenance')
            expect(validStatuses).toContain('Archived')
        })

        it('should have exactly 4 status types', () => {
            expect(validStatuses.length).toBe(4)
        })
    })

    describe('Project Type', () => {
        const validTypes: ProjectType[] = ['Tool', 'Platform', 'Research', 'AI Agent', 'Analytics', 'Experiment', 'Other']
        
        it('should have all expected project types', () => {
            expect(validTypes).toContain('Tool')
            expect(validTypes).toContain('Platform')
            expect(validTypes).toContain('Research')
            expect(validTypes).toContain('AI Agent')
            expect(validTypes).toContain('Analytics')
            expect(validTypes).toContain('Experiment')
            expect(validTypes).toContain('Other')
        })

        it('should have exactly 7 project types', () => {
            expect(validTypes.length).toBe(7)
        })
    })

    describe('Mission Type', () => {
        it('should create a valid mission object', () => {
            const mission: Mission = {
                id: 'test-id',
                user_id: 'user-123',
                title: 'Career Goals',
                statement: 'Build a successful career',
                color: '#3B82F6',
                order_index: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            expect(mission.id).toBe('test-id')
            expect(mission.title).toBe('Career Goals')
            expect(mission.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
        })

        it('should create a valid mission insert object', () => {
            const missionInsert: MissionInsert = {
                title: 'New Mission',
                statement: 'A new mission statement',
                color: '#10B981',
            }

            expect(missionInsert.title).toBe('New Mission')
            expect(missionInsert.id).toBeUndefined()
        })
    })

    describe('Project Type', () => {
        it('should create a valid project object', () => {
            const project: Project = {
                id: 'project-1',
                user_id: 'user-123',
                mission_id: 'mission-1',
                title: 'Test Project',
                status: 'Active',
                progress: 75,
                type: 'Tool',
                description: 'A test project',
                github_url: 'https://github.com/test/repo',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }

            expect(project.status).toBe('Active')
            expect(project.progress).toBeGreaterThanOrEqual(0)
            expect(project.progress).toBeLessThanOrEqual(100)
        })

        it('should create a valid project insert object with defaults', () => {
            const projectInsert: ProjectInsert = {
                mission_id: 'mission-1',
                title: 'New Project',
            }

            expect(projectInsert.title).toBe('New Project')
            expect(projectInsert.status).toBeUndefined() // Has default in DB
            expect(projectInsert.progress).toBeUndefined() // Has default in DB
        })
    })

    describe('MissionWithProjects Type', () => {
        it('should create a valid mission with projects array', () => {
            const missionWithProjects: MissionWithProjects = {
                id: 'mission-1',
                user_id: 'user-123',
                title: 'Career',
                statement: 'Build a career',
                color: '#3B82F6',
                order_index: 1,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                projects: [
                    {
                        id: 'project-1',
                        user_id: 'user-123',
                        mission_id: 'mission-1',
                        title: 'Project 1',
                        status: 'Active',
                        progress: 50,
                        type: 'Tool',
                        description: null,
                        github_url: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ]
            }

            expect(missionWithProjects.projects).toHaveLength(1)
            expect(missionWithProjects.projects[0].mission_id).toBe(missionWithProjects.id)
        })
    })
})
