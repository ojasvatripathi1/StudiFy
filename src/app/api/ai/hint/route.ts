import { NextResponse } from 'next/server';
import { isGroqConfigured } from '@/lib/groqService';
import { chatWithGroq } from '@/lib/groqService';
import { chatWithOllama } from '@/lib/ollamaService';

/**
 * Generate a quiz hint using Groq when configured (fast), otherwise Ollama.
 * POST body: { question: string, options: string[] }
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const question = body.question ?? '';
        const options = Array.isArray(body.options) ? body.options : [];

        const message =
            `Provide a subtle hint for this quiz question. Help me think through it without giving the answer.

Question: ${question}
Options: ${options.join(', ')}

Provide a one-sentence subtle hint.`.trim();

        if (isGroqConfigured()) {
            const result = await chatWithGroq(message, [], undefined);
            return NextResponse.json({ response: result.response });
        }

        const result = await chatWithOllama(message, [], undefined);
        return NextResponse.json({ response: result.response });
    } catch (err: unknown) {
        console.error('AI hint generation error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Hint generation failed';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
