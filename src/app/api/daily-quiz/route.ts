import { NextResponse } from 'next/server';
import { chatWithGroq, isGroqConfigured } from '@/lib/groqService';
import { chatWithOllama } from '@/lib/ollamaService';
import { parseQuizResponse } from '@/lib/quizGenerator';

/**
 * GET /api/daily-quiz
 * Generates a new quiz using Ollama (or Groq fallback).
 * This API now ONLY handles generation to avoid Firestore permission issues on the server.
 * Persistence is handled by the client.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty') || 'medium';

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }
    
    // Build a more robust prompt for Groq/Ollama
    const prompt = `Generate exactly 5 technical multiple-choice questions for computer science students.
Topic: ${topic}
Difficulty: ${difficulty}

IMPORTANT: You MUST vary the correct answer position (a, b, c, or d). Do NOT make all answers the same letter.

Format:
1. Question?
a) Option 1
b) Option 2
c) Option 3
d) Option 4
Answer: a (or b, c, d)

Rules:
- Questions must be professional and technically accurate.
- Use EXACTLY the format shown above.
- No conversational text or headers. Just the questions.`;

    let responseText = '';
    console.log('--- Daily Quiz Generation Started ---');
    console.log('Topic:', topic);
    
    // Prioritize Groq for speed if configured
    if (isGroqConfigured()) {
      console.log('Attempting generation with Groq (for speed)...');
      try {
        const groqRes = await chatWithGroq(prompt, []);
        responseText = groqRes.response;
        console.log('Groq generation successful');
      } catch (groqErr: unknown) {
        const groqErrorMessage = groqErr instanceof Error ? groqErr.message : 'Unknown Groq error';
        console.error('Groq generation failed:', groqErrorMessage);
        console.warn('Trying Ollama fallback...');
        
        try {
          const ollamaRes = await chatWithOllama(prompt, []);
          responseText = ollamaRes.response;
          console.log('Ollama fallback successful');
        } catch (ollamaErr: unknown) {
          const ollamaErrorMessage = ollamaErr instanceof Error ? ollamaErr.message : 'Unknown Ollama error';
          console.error('Ollama fallback also failed:', ollamaErrorMessage);
          throw new Error(`Both Groq and Ollama failed. Groq error: ${groqErrorMessage}. Ollama error: ${ollamaErrorMessage}`);
        }
      }
    } else {
      console.log('Groq not configured, attempting generation with Ollama...');
      try {
        const ollamaRes = await chatWithOllama(prompt, []);
        responseText = ollamaRes.response;
        console.log('Ollama generation successful');
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown Ollama error';
        console.error('Ollama generation failed:', errorMessage);
        throw new Error(`Ollama generation failed and Groq is not configured. Error: ${errorMessage}`);
      }
    }

    console.log('Parsing AI response...');
    const questions = parseQuizResponse(responseText);
    
    if (!questions || questions.length === 0) {
      console.error('Failed to parse questions from AI response:', responseText);
      throw new Error('AI failed to generate valid quiz questions. The response format was unexpected.');
    }
    
    console.log(`Successfully parsed ${questions.length} questions`);
    
    return NextResponse.json({
      topic,
      difficulty,
      questions: questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    });

  } catch (error: unknown) {
    console.error('Daily Quiz API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate daily quiz';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
