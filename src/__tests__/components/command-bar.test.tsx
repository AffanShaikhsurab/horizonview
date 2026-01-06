import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CommandBar } from '@/components/command-bar'

// Mock the AI provider module to avoid ESM issues
jest.mock('@/lib/ai-provider', () => ({
    aiProvider: {
        hasAnyProvider: false,
        availableProviders: [],
        currentProvider: null,
        switchProvider: jest.fn(),
    }
}))

// Mock the AI settings hook
jest.mock('@/hooks/use-ai-settings', () => ({
    useAISettings: () => ({
        aiProvider: null,
        providerError: null,
        refreshProviders: jest.fn(),
    })
}))

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

describe('CommandBar', () => {
    it('should render the command input', () => {
        renderWithProviders(<CommandBar onCommand={jest.fn()} />)

        const input = screen.getByPlaceholderText(/Add project, archive/i)
        expect(input).toBeInTheDocument()
    })

    it('should call onCommand when form is submitted', () => {
        const onCommand = jest.fn()
        renderWithProviders(<CommandBar onCommand={onCommand} />)

        const input = screen.getByPlaceholderText(/Add project, archive/i)
        const form = document.querySelector('form')
        
        fireEvent.change(input, { target: { value: 'test command' } })
        fireEvent.submit(form!)

        expect(onCommand).toHaveBeenCalledWith('test command')
    })

    it('should clear input after command is submitted', () => {
        const onCommand = jest.fn()
        renderWithProviders(<CommandBar onCommand={onCommand} />)

        const input = screen.getByPlaceholderText(/Add project, archive/i) as HTMLInputElement
        const form = document.querySelector('form')
        
        fireEvent.change(input, { target: { value: 'test command' } })
        fireEvent.submit(form!)

        expect(input.value).toBe('')
    })

    it('should not call onCommand for empty input', () => {
        const onCommand = jest.fn()
        renderWithProviders(<CommandBar onCommand={onCommand} />)

        const form = document.querySelector('form')
        fireEvent.submit(form!)

        expect(onCommand).not.toHaveBeenCalled()
    })

    it('should render command hints', () => {
        renderWithProviders(<CommandBar onCommand={jest.fn()} />)
        
        expect(screen.getByText(/import github/i)).toBeInTheDocument()
        expect(screen.getByText(/new mission/i)).toBeInTheDocument()
        expect(screen.getByText(/ai settings/i)).toBeInTheDocument()
    })

    it('should render voice command button', () => {
        renderWithProviders(<CommandBar onCommand={jest.fn()} />)
        
        expect(screen.getByTitle('Voice command (AI)')).toBeInTheDocument()
    })
})
