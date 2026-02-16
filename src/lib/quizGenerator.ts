import { QuizQuestion } from './types';

export interface GeneratedQuiz {
  topic: string;
  questions: QuizQuestion[];
  category: 'custom';
}

/**
 * Parse quiz questions from AI response
 * Expects format like:
 * 1. Question text?
 * a) Option 1
 * b) Option 2
 * c) Option 3
 * d) Option 4
 * Answer: a
 */
export function parseQuizResponse(response: string): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const lines = response.split('\n').filter(line => line.trim());

  let currentQuestion: Partial<QuizQuestion> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detect question line (starts with number and .)
    if (/^\d+\.\s/.test(line)) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.question && currentQuestion.options) {
        questions.push({
          id: `q${questions.length + 1}`,
          category: 'custom',
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer || 0,
          difficulty: 'medium',
          points: 5,
        } as QuizQuestion);
      }

      // Start new question
      currentQuestion = {
        question: line.replace(/^\d+\.\s/, '').trim(),
        options: [],
        correctAnswer: 0,
      };
    }
    // Detect option lines (a), b), c), d))
    else if (/^[a-d]\)\s/.test(line)) {
      if (currentQuestion) {
        currentQuestion.options = currentQuestion.options || [];
        currentQuestion.options.push(line.replace(/^[a-d]\)\s/, '').trim());
      }
    }
    // Detect answer line
    else if (/^answer:/i.test(line)) {
      if (currentQuestion) {
        const answerLetter = line.match(/[a-d]/i)?.[0]?.toLowerCase();
        if (answerLetter) {
          const answerIndex = answerLetter.charCodeAt(0) - 'a'.charCodeAt(0);
          currentQuestion.correctAnswer = answerIndex;
        }
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.question && currentQuestion.options) {
    questions.push({
      id: `q${questions.length + 1}`,
      category: 'custom',
      question: currentQuestion.question,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer || 0,
      difficulty: 'medium',
      points: 5,
    } as QuizQuestion);
  }

  // Ensure we have at least the minimum questions
  if (questions.length === 0) {
    console.warn('No questions parsed from response, creating placeholder');
    questions.push({
      id: 'q1',
      category: 'custom',
      question: 'What is the main topic of the uploaded material?',
      options: ['Not enough data to generate questions', 'Please upload a document', 'Try again', 'Other'],
      correctAnswer: 0,
      difficulty: 'easy',
      points: 5,
    });
  }

  return questions;
}

/**
 * Generate quiz from content using Ollama
 */
export async function generateQuizFromContent(
  content: string,
  topic?: string,
  numberOfQuestions: number = 10
): Promise<GeneratedQuiz> {
  try {
    if (!content || content.trim().length < 20) {
      throw new Error('Content is too short to generate quiz questions');
    }

    const topicContext = topic ? ` The topic is: ${topic}.` : '';
    const prompt = `Generate exactly ${numberOfQuestions} multiple choice quiz questions based on the following content.${topicContext}
IMPORTANT: Ensure the correct answers are distributed across options (a, b, c, and d) randomly. Do not always make the first option the correct one.

Format each question like this:
1. Question text?
a) First option
b) Second option
c) Third option
d) Fourth option
Answer: b

Content:
${content.substring(0, 3000)}`;

    const res = await fetch('/api/ollama', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        history: [],
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to generate quiz: ${res.statusText}`);
    }

    const data = await res.json();
    const responseText = data.response;

    const questions = parseQuizResponse(responseText);

    // Shuffle options locally to ensure complete randomness and fix bias
    const shuffledQuestions = questions.map(q => {
      // Create array of indices [0, 1, 2, 3]
      const indices = q.options.map((_, i) => i);
      // Shuffle indices
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      // Reorder options and find new correct answer index
      const newOptions = indices.map(i => q.options[i]);
      const newCorrectAnswer = indices.indexOf(q.correctAnswer);

      return {
        ...q,
        options: newOptions,
        correctAnswer: newCorrectAnswer
      };
    });

    // Limit to requested number of questions
    const finalQuestions = shuffledQuestions.slice(0, numberOfQuestions);

    return {
      topic: topic || 'Study Material',
      questions: finalQuestions,
      category: 'custom',
    };
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}

/**
 * Validate and fix quiz questions
 */
export function validateQuizQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return questions.map((q, index) => ({
    ...q,
    id: `q${index + 1}`,
    options: q.options.slice(0, 4), // Ensure max 4 options
    correctAnswer: Math.max(0, Math.min(q.correctAnswer, q.options.length - 1)),
    points: q.points || 5,
  }));
}
