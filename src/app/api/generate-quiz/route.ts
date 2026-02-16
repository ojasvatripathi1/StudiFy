import { NextRequest, NextResponse } from 'next/server';
import { generateQuizFromContent } from '@/lib/quizGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, topic, numberOfQuestions = 5 } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const quiz = await generateQuizFromContent(
      content,
      topic,
      numberOfQuestions
    );

    return NextResponse.json(quiz, { status: 200 });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
