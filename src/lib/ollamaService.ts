// Ollama AI integration service

import { UserData } from './types';

export interface OllamaConfig {
  baseURL: string;
  model: string;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  model: string;
  createdAt: string;
  totalDuration: number;
  loadDuration: number;
  promptEvalCount: number;
  promptEvalDuration: number;
  evalCount: number;
  evalDuration: number;
}

// Use llama3 by default for local Ollama (gpt-oss is for Groq)
const DEFAULT_CONFIG: OllamaConfig = {
  baseURL: process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://127.0.0.1:11434',
  model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama3',
  temperature: 0.7,
};

/**
 * Chat with Ollama using study material context
 */
export async function chatWithOllama(
  userMessage: string,
  conversationHistory: ChatMessage[],
  studyMaterial?: string,
  imageData?: string, // Base64 image data
  config: OllamaConfig = DEFAULT_CONFIG,
  userData?: Partial<UserData>
): Promise<ChatResponse> {
  try {
    // Build the system prompt with study material and user account context
    let systemPrompt =
      'You are a helpful study assistant for StudiFy. Answer questions clearly and concisely. You have access to the user\'s account details if provided.';

    if (userData) {
      systemPrompt += `\n\n[USER ACCOUNT DETAILS]:
- Name: ${userData.displayName} (@${userData.username})
- Coins: ${userData.coins}
- Rank: ${userData.rank || 'Unranked'}
- Login Streak: ${userData.loginStreak} days
- Total Quizzes Taken: ${userData.totalQuizzesTaken}
- Badges: ${(userData.badges?.length || 0) > 0 ? userData.badges?.join(', ') : 'None'}
- Quiz Streaks: DS/Algo: ${userData.quizStreaks?.ds_algo}, DB: ${userData.quizStreaks?.database}, OS: ${userData.quizStreaks?.os}, Networks: ${userData.quizStreaks?.networks}
- Perfect Days: ${userData.perfectDays}

Use this information to answer personal questions about their progress, coins, streaks, and achievements. Be encouraging and reference their stats when relevant.`;
    }

    if (studyMaterial) {
      const materialType = imageData ? "IMAGE (OCR & Visual)" : "DOCUMENT";
      systemPrompt += `\n\n[ATTACHED ${materialType} CONTENT]:\n${studyMaterial}\n\nUSER NOTE: The user has uploaded an ${imageData ? "image" : "file"}. The text above is the content extracted from it. ${imageData ? "The OCR might be imperfect or fragmented if the image is a complex diagram. Use the context to reconstruct missing words if needed." : ""} ${imageData ? "Additionally, the raw image data has been sent to your vision module for visual analysis." : ""} Do NOT claim you cannot see or access the ${imageData ? "image" : "file"}. Answer the user's request based on both the text and visual content.`;
    }

    // Build messages array with system prompt
    const cleanImageData = imageData ? (imageData.includes(',') ? imageData.split(',')[1] : imageData) : undefined;
    
    interface OllamaMessage {
      role: string;
      content: string;
      images?: string[];
    }

    const messages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
      { 
        role: 'user', 
        content: userMessage,
        ...(cleanImageData && { images: [cleanImageData] })
      },
    ];

    const response = await fetch(`${config.baseURL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: imageData ? (process.env.NEXT_PUBLIC_OLLAMA_VISION_MODEL || 'llava') : config.model,
        messages,
        stream: false,
        temperature: config.temperature,
        top_p: config.topP,
        top_k: config.topK,
      }),
    }).catch(err => {
      console.error('Fetch to Ollama failed:', err);
      throw new Error(`Failed to connect to Ollama at ${config.baseURL}. Make sure Ollama is running and accessible. Error: ${err.message}`);
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();

    return {
      response: data.message?.content || data.response || '',
      model: data.model || config.model,
      createdAt: new Date().toISOString(),
      totalDuration: data.total_duration || 0,
      loadDuration: data.load_duration || 0,
      promptEvalCount: data.prompt_eval_count || 0,
      promptEvalDuration: data.prompt_eval_duration || 0,
      evalCount: data.eval_count || 0,
      evalDuration: data.eval_duration || 0,
    };
  } catch (error) {
    console.error('Error calling Ollama API:', error);
    throw error;
  }
}

/**
 * Stream chat with Ollama
 */
export async function streamChatWithOllama(
  userMessage: string,
  conversationHistory: ChatMessage[],
  studyMaterial?: string,
  imageData?: string, // Base64 image data
  config: OllamaConfig = DEFAULT_CONFIG,
  userData?: Partial<UserData>
): Promise<Response> {
  // Build the system prompt with study material and user account context
  let systemPrompt =
    'You are a helpful study assistant for StudiFy. Answer questions clearly and concisely. You have access to the user\'s account details if provided.';

  if (userData) {
    systemPrompt += `\n\n[USER ACCOUNT DETAILS]:
- Name: ${userData.displayName} (@${userData.username})
- Coins: ${userData.coins}
- Rank: ${userData.rank || 'Unranked'}
- Login Streak: ${userData.loginStreak} days
- Total Quizzes Taken: ${userData.totalQuizzesTaken}
- Badges: ${(userData.badges?.length || 0) > 0 ? userData.badges?.join(', ') : 'None'}
- Quiz Streaks: DS/Algo: ${userData.quizStreaks?.ds_algo}, DB: ${userData.quizStreaks?.database}, OS: ${userData.quizStreaks?.os}, Networks: ${userData.quizStreaks?.networks}
- Perfect Days: ${userData.perfectDays}

Use this information to answer personal questions about their progress, coins, streaks, and achievements. Be encouraging and reference their stats when relevant.

[CONVERSATIONAL QUIZ CREATION]:
If a user asks to create a quiz (e.g., "Create a quiz on Python"), follow this process:
1. Ask them for the number of questions and the difficulty level (Easy, Medium, or Hard).
2. Once they provide those, generate the quiz.
3. IMPORTANT: When you are ready to provide the final quiz, you MUST wrap the quiz data in a JSON block like this:
\`\`\`json
{
  "type": "quiz_data",
  "title": "Python Basics Quiz",
  "questions": [
    {
      "question": "What is Python?",
      "options": ["Language", "Snake", "Car", "Food"],
      "correctAnswer": 0,
      "difficulty": "easy",
      "points": 5
    }
  ]
}
\`\`\`
The user will then see a "Save & Publish" button to save it. Do not just list the questions; provide this JSON block at the end of your response.`;
  }

  if (studyMaterial) {
    const materialType = imageData ? "IMAGE (OCR & Visual)" : "DOCUMENT";
    systemPrompt += `\n\n[ATTACHED ${materialType} CONTENT]:\n${studyMaterial}\n\nUSER NOTE: The user has uploaded an ${imageData ? "image" : "file"}. The text above is the content extracted from it. ${imageData ? "The OCR might be imperfect or fragmented if the image is a complex diagram. Use the context to reconstruct missing words if needed." : ""} ${imageData ? "Additionally, the raw image data has been sent to your vision module for visual analysis." : ""} Do NOT claim you cannot see or access the ${imageData ? "image" : "file"}. Answer the user's request based on both the text and visual content.`;
  }

  // Build messages array with system prompt
  const cleanImageData = imageData ? (imageData.includes(',') ? imageData.split(',')[1] : imageData) : undefined;
  
  interface OllamaMessage {
    role: string;
    content: string;
    images?: string[];
  }

  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({ role: msg.role, content: msg.content })),
    { 
      role: 'user', 
      content: userMessage,
      ...(cleanImageData && { images: [cleanImageData] })
    },
  ];

  return fetch(`${config.baseURL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: imageData ? (process.env.NEXT_PUBLIC_OLLAMA_VISION_MODEL || 'llava') : config.model,
      messages: messages,
      stream: true,
      temperature: config.temperature,
      top_p: config.topP,
      top_k: config.topK,
    }),
  });
}

/**
 * Generate a summary of study material
 */
export async function summarizeStudyMaterial(
  studyMaterial: string,
  config: OllamaConfig = DEFAULT_CONFIG
): Promise<string> {
  const response = await chatWithOllama(
    `Please provide a concise summary of the following study material:\n\n${studyMaterial}`,
    [],
    undefined,
    undefined,
    config
  );

  return response.response;
}

/**
 * Generate quiz questions from study material
 */
export async function generateQuizQuestions(
  studyMaterial: string,
  numberOfQuestions: number = 5,
  config: OllamaConfig = DEFAULT_CONFIG
): Promise<string> {
  const response = await chatWithOllama(
    `Generate ${numberOfQuestions} quiz questions based on the following study material. Format each question clearly:\n\n${studyMaterial}`,
    [],
    undefined,
    undefined,
    config
  );

  return response.response;
}

/**
 * Generate study notes from material
 */
export async function generateStudyNotes(
  studyMaterial: string,
  topic?: string,
  config: OllamaConfig = DEFAULT_CONFIG
): Promise<string> {
  const topicContext = topic ? ` Focus on the topic: ${topic}` : '';
  const response = await chatWithOllama(
    `Create well-organized study notes from the following material.${topicContext}\n\nMaterial:\n${studyMaterial}`,
    [],
    undefined,
    undefined,
    config
  );

  return response.response;
}

/**
 * Check if Ollama is available
 */
export async function isOllamaAvailable(
  baseURL: string = DEFAULT_CONFIG.baseURL
): Promise<boolean> {
  try {
    const response = await fetch(`${baseURL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get available Ollama models
 */
export async function getAvailableModels(
  baseURL: string = DEFAULT_CONFIG.baseURL
): Promise<string[]> {
  try {
    const response = await fetch(`${baseURL}/api/tags`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return data.models?.map((model: { name: string }) => model.name) || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}
/**
 * Generate a hint for a quiz question
 */
export async function generateQuizHint(
  question: string,
  options: string[],
  config: OllamaConfig = DEFAULT_CONFIG
): Promise<string> {
  const prompt = `You are a helpful study tutor. Provide a subtle hint for the following quiz question. 
Do NOT give the direct answer. Help the student think through it.

Question: ${question}
Options: ${options.join(', ')}

Provide a one-sentence subtle hint.`;

  const response = await chatWithOllama(prompt, [], undefined, undefined, config);
  return response.response;
}
