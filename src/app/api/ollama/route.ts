import { NextResponse } from 'next/server';
import { chatWithOllama, streamChatWithOllama } from '@/lib/ollamaService';
import {
    chatWithGroq,
    streamChatWithGroq,
    isGroqConfigured,
} from '@/lib/groqService';

const useGroq = isGroqConfigured();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        console.log('API Request:', { 
            hasMessage: !!body.message, 
            hasHistory: !!body.history, 
            hasMaterial: !!body.studyMaterial,
            hasImage: !!body.imageData,
            hasUserData: !!body.userData,
            useGroq 
        });

        if (body.stream) {
            if (useGroq) {
                const groqRes = await streamChatWithGroq(
                    body.message,
                    body.history || [],
                    body.studyMaterial,
                    body.imageData,
                    undefined,
                    body.userData
                );
                // Transform Groq SSE to Ollama-style NDJSON so the client works unchanged
                const stream = new ReadableStream({
                    async start(controller) {
                        const reader = groqRes.body!.getReader();
                        const decoder = new TextDecoder();
                        let buffer = '';
                        try {
                            while (true) {
                                const { done, value } = await reader.read();
                                if (done) break;
                                buffer += decoder.decode(value, { stream: true });
                                const lines = buffer.split('\n');
                                buffer = lines.pop() ?? '';
                                for (const line of lines) {
                                    if (line.startsWith('data: ')) {
                                        const raw = line.slice(6);
                                        if (raw === '[DONE]') {
                                            controller.enqueue(
                                                new TextEncoder().encode(
                                                    JSON.stringify({ done: true }) + '\n'
                                                )
                                            );
                                            continue;
                                        }
                                        try {
                                            const obj = JSON.parse(raw);
                                            const content =
                                                obj.choices?.[0]?.delta?.content;
                                            if (typeof content === 'string') {
                                                controller.enqueue(
                                                    new TextEncoder().encode(
                                                        JSON.stringify({
                                                            message: {
                                                                role: 'assistant',
                                                                content,
                                                            },
                                                            done: false,
                                                        }) + '\n'
                                                    )
                                                );
                                            }
                                        } catch {
                                            // skip invalid JSON
                                        }
                                    }
                                }
                            }
                            if (buffer.trim()) {
                                const line = buffer;
                                if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
                                    try {
                                        const obj = JSON.parse(line.slice(6));
                                        const content = obj.choices?.[0]?.delta?.content;
                                        if (typeof content === 'string') {
                                            controller.enqueue(
                                                new TextEncoder().encode(
                                                    JSON.stringify({
                                                        message: { role: 'assistant', content },
                                                        done: false,
                                                    }) + '\n'
                                                )
                                            );
                                        }
                                    } catch {
                                        // skip
                                    }
                                }
                            }
                            controller.enqueue(
                                new TextEncoder().encode(
                                    JSON.stringify({ done: true }) + '\n'
                                )
                            );
                        } finally {
                            controller.close();
                        }
                    },
                });
                return new Response(stream, {
                    headers: { 'Content-Type': 'application/x-ndjson' },
                });
            }
            const response = await streamChatWithOllama(
                body.message,
                body.history || [],
                body.studyMaterial,
                body.imageData,
                undefined,
                body.userData
            );
            return response;
        }

        if (useGroq) {
            const result = await chatWithGroq(
                body.message,
                body.history || [],
                body.studyMaterial,
                body.imageData,
                undefined,
                body.userData
            );
            return NextResponse.json({
                response: result.response,
                model: result.model,
                createdAt: new Date().toISOString(),
            });
        }

        const result = await chatWithOllama(
            body.message,
            body.history || [],
            body.studyMaterial,
            body.imageData,
            undefined,
            body.userData
        );
        return NextResponse.json(result);
    } catch (error: unknown) {
        console.error('Ollama/Groq Route Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
