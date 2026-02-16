import { NextResponse } from 'next/server';
import { isGroqConfigured } from '@/lib/groqService';
import { isOllamaAvailable } from '@/lib/ollamaService';

export async function GET() {
    try {
        if (isGroqConfigured()) {
            return NextResponse.json({ available: true, provider: 'groq' });
        }
        const ollamaAvailable = await isOllamaAvailable();
        return NextResponse.json({
            available: ollamaAvailable,
            provider: 'ollama',
        });
    } catch {
        return NextResponse.json({ available: false, provider: null });
    }
}
