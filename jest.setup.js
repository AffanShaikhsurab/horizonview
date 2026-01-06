import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
        }
    },
    usePathname() {
        return '/'
    },
    useSearchParams() {
        return new URLSearchParams()
    },
}))

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
    useSession: jest.fn(() => ({
        session: { getToken: jest.fn().mockResolvedValue('mock-token') },
    })),
    useUser: jest.fn(() => ({
        user: { id: 'test-user-id', fullName: 'Test User' },
    })),
    ClerkProvider: ({ children }) => children,
    SignInButton: () => null,
    SignUpButton: () => null,
    UserButton: () => null,
}))

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
    createClient: jest.fn(() => ({
        from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        })),
    })),
    createAuthenticatedClient: jest.fn(() =>
        Promise.resolve({
            from: jest.fn(() => ({
                select: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                delete: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                order: jest.fn().mockReturnThis(),
                single: jest.fn().mockReturnThis(),
            })),
        })
    ),
}))
