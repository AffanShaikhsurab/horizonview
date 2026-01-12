import { streamText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'

const SYSTEM_PROMPT = `You are Horizon Assistant, a helpful AI assistant for the HorizonView life mission dashboard.

Your role is to:
- Help users manage their missions and projects
- Encourage focusing on 1-2 active projects at a time
- Provide clear, concise guidance on productivity and focus
- Answer questions about the user's projects and missions

Energy Rule: Each active project consumes 20% of focus energy. Users should aim to keep remaining energy above 40% for optimal performance.

Be helpful, encouraging, and focused on productivity. Keep responses concise but thorough.`

interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

interface ChatRequest {
    messages: ChatMessage[]
    context?: {
        missions?: Array<{
            title: string
            projects: Array<{
                title: string
                status: string
                progress: number
            }>
        }>
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json() as ChatRequest
        const { messages, context } = body

        // Try to get API keys from request headers (passed from client)
        const geminiKey = request.headers.get('x-gemini-key')
        const groqKey = request.headers.get('x-groq-key')

        // Build context message if provided
        let contextMessage = ''
        if (context?.missions && context.missions.length > 0) {
            const allProjects = context.missions.flatMap(m => m.projects)
            const active = allProjects.filter(p => p.status === 'Active')
            const usedEnergy = active.length * 20
            const remainingEnergy = Math.max(0, 100 - usedEnergy)

            const overview = context.missions
                .map(m => {
                    const items = m.projects.map(p => {
                        const prog = p.status === 'Active' ? ` (${p.progress}%)` : ''
                        return `- ${p.title} [${p.status}]${prog}`
                    })
                    return `${m.title}:\n${items.join('\n') || '- No projects'}`
                })
                .join('\n\n')

            contextMessage = `\n\nCurrent User Context:
Energy used: ${usedEnergy}%, Remaining: ${remainingEnergy}%
Active projects: ${active.length}

Missions Overview:
${overview}`
        }

        const systemPrompt = SYSTEM_PROMPT + contextMessage

        // Try Gemini first, then Groq
        if (geminiKey) {
            try {
                const google = createGoogleGenerativeAI({ apiKey: geminiKey })
                const result = streamText({
                    model: google('gemini-2.0-flash'),
                    system: systemPrompt,
                    messages,
                })
                return result.toTextStreamResponse()
            } catch (error) {
                console.warn('Gemini failed, trying Groq:', error)
            }
        }

        if (groqKey) {
            try {
                const groq = createGroq({ apiKey: groqKey })
                const result = streamText({
                    model: groq('llama-3.3-70b-versatile'),
                    system: systemPrompt,
                    messages,
                })
                return result.toTextStreamResponse()
            } catch (error) {
                console.error('Groq also failed:', error)
            }
        }

        // No API keys or both failed
        return new Response(
            JSON.stringify({
                error: 'No AI provider configured. Please add your API keys in AI Settings.'
            }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    } catch (error) {
        console.error('Chat API error:', error)
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'An error occurred'
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            }
        )
    }
}
