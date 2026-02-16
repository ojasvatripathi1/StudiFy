/**
 * Groq AI integration - ultra-fast cloud inference.
 * Set GROQ_API_KEY in .env.local to use instead of Ollama for much faster responses.
 * Free tier: https://console.groq.com
 */

import { UserData } from './types';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Fast models: openai/gpt-oss-120b (quality), llama-3.3-70b-versatile (quality), llama-3.1-8b-instant (fastest)
const DEFAULT_GROQ_MODEL = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b';

export async function chatWithGroq(
  userMessage: string,
  conversationHistory: ChatMessage[],
  studyMaterial?: string,
  imageData?: string,
  apiKey?: string,
  userData?: Partial<UserData>
): Promise<{ response: string; model: string }> {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set');

  let systemContent = 'You are a helpful study assistant for StudiFy. Answer questions clearly and concisely. You have access to the user\'s account details if provided.';

  if (userData) {
    systemContent += `\n\n[USER ACCOUNT DETAILS]:
- Name: ${userData.displayName} (@${userData.username})
- Coins: ${userData.coins}
- Rank: ${userData.rank || 'Unranked'}
- Login Streak: ${userData.loginStreak} days
- Total Quizzes Taken: ${userData.totalQuizzesTaken}
- Badges: ${userData.badges?.length > 0 ? userData.badges.join(', ') : 'None'}
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
    systemContent += `\n\n[ATTACHED ${materialType} CONTENT]:\n${studyMaterial}\n\nUSER NOTE: The user has uploaded an ${imageData ? "image" : "file"}. The text above is the content extracted from it. ${imageData ? "The OCR might be imperfect or fragmented if the image is a complex diagram. Use the context to reconstruct missing words if needed." : ""} Do NOT claim you cannot see or access the ${imageData ? "image" : "file"}. Answer the user's request based on the provided content.`;
  }

  // Use vision-capable model if image data is present
  // meta-llama/llama-4-scout-17b-16e-instruct is the recommended replacement for llama-3.2-11b-vision-preview
  const model = imageData ? 'meta-llama/llama-4-scout-17b-16e-instruct' : DEFAULT_GROQ_MODEL;

  interface GroqMessage {
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }

  const messages: GroqMessage[] = [
    { role: 'system', content: systemContent },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  if (imageData) {
    // Ensure image data is just the base64 string without prefix
    const cleanBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    
    messages.push({ 
      role: 'user', 
      content: [
        { type: 'text', text: userMessage },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: userMessage });
  }

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API error: ${res.statusText}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? '';
  return { response: content, model: data.model || DEFAULT_GROQ_MODEL };
}

export async function streamChatWithGroq(
  userMessage: string,
  conversationHistory: ChatMessage[],
  studyMaterial?: string,
  imageData?: string,
  apiKey?: string,
  userData?: Partial<UserData>
): Promise<Response> {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY is not set');

  let systemContent = 'You are a helpful study assistant for StudiFy. Answer questions clearly and concisely. You have access to the user\'s account details if provided.';

  if (userData) {
    systemContent += `\n\n[USER ACCOUNT DETAILS]:
- Name: ${userData.displayName} (@${userData.username})
- Coins: ${userData.coins}
- Rank: ${userData.rank || 'Unranked'}
- Login Streak: ${userData.loginStreak} days
- Total Quizzes Taken: ${userData.totalQuizzesTaken}
- Badges: ${userData.badges?.length > 0 ? userData.badges.join(', ') : 'None'}
- Quiz Streaks: DS/Algo: ${userData.quizStreaks?.ds_algo}, DB: ${userData.quizStreaks?.database}, OS: ${userData.quizStreaks?.os}, Networks: ${userData.quizStreaks?.networks}
- Perfect Days: ${userData.perfectDays}

Use this information to answer personal questions about their progress, coins, streaks, and achievements. Be encouraging and reference their stats when relevant.`;
  }

  if (studyMaterial) {
    const materialType = imageData ? "IMAGE (OCR & Visual)" : "DOCUMENT";
    systemContent += `\n\n[ATTACHED ${materialType} CONTENT]:\n${studyMaterial}\n\nUSER NOTE: The user has uploaded an ${imageData ? "image" : "file"}. The text above is the content extracted from it. ${imageData ? "The OCR might be imperfect or fragmented if the image is a complex diagram. Use the context to reconstruct missing words if needed." : ""} Do NOT claim you cannot see or access the ${imageData ? "image" : "file"}. Answer the user's request based on the provided content.`;
  }

  // Use vision-capable model if image data is present
  // meta-llama/llama-4-scout-17b-16e-instruct is the recommended replacement for llama-3.2-11b-vision-preview
  const model = imageData ? 'meta-llama/llama-4-scout-17b-16e-instruct' : DEFAULT_GROQ_MODEL;

  interface GroqMessage {
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }

  const messages: GroqMessage[] = [
    { role: 'system', content: systemContent },
    ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  if (imageData) {
    // Ensure image data is just the base64 string without prefix
    const cleanBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
    
    messages.push({ 
      role: 'user', 
      content: [
        { type: 'text', text: userMessage },
        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
      ]
    });
  } else {
    messages.push({ role: 'user', content: userMessage });
  }

  const res = await fetch(GROQ_CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq API error: ${res.statusText}`);
  }

  return res;
}

export function isGroqConfigured(): boolean {
  return typeof process !== 'undefined' && !!process.env.GROQ_API_KEY;
}
