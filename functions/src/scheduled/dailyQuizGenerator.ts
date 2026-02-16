import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();

interface DailyQuiz {
  date: string;
  subject: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  difficulty: "easy" | "medium" | "hard";
}

const CS_SUBJECTS = [
  "Data Structures",
  "Algorithms",
  "Database Management Systems",
  "Operating Systems",
  "Computer Networks",
  "Web Development",
  "Artificial Intelligence",
  "Machine Learning",
  "Software Engineering",
  "Cybersecurity",
  "Cloud Computing",
  "Microservices Architecture",
  "Object-Oriented Programming",
  "Functional Programming",
  "Distributed Systems",
];

const DIFFICULTIES = ["easy", "medium", "hard"];

/**
 * Generates a daily quiz using Ollama AI
 */
export const generateDailyQuiz = onSchedule(
  {
    schedule: "0 6 * * *", // Runs every day at 6:00 AM
    timeZone: "Asia/Kolkata",
    memory: "1GiB",
    timeoutSeconds: 540,
    minInstances: 0,
    maxInstances: 1,
  },
  async () => {
    const db = admin.firestore();
    const today = new Date().toISOString().split("T")[0];

    try {
      console.log(`🎯 Generating daily quiz for ${today}`);

      // Check if quiz already exists for today
      const existingQuiz = await db
        .collection("dailyQuizzes")
        .where("date", "==", today)
        .limit(1)
        .get();

      if (!existingQuiz.empty) {
        console.log("✅ Daily quiz already exists for today");
        return;
      }

      // Select random subject and difficulty
      const subject =
        CS_SUBJECTS[Math.floor(Math.random() * CS_SUBJECTS.length)];
      const difficulty =
        DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];

      console.log(`📚 Subject: ${subject}, Difficulty: ${difficulty}`);

      // Generate quiz using Ollama
      const quiz = await generateQuizWithOllama(subject, difficulty);

      // Save to Firestore
      const quizData: DailyQuiz = {
        date: today,
        subject,
        questions: quiz.questions,
        difficulty: difficulty as "easy" | "medium" | "hard",
      };

      await db.collection("dailyQuizzes").add({
        ...quizData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `✅ Daily quiz generated successfully for ${today} - ${subject}`
      );
    } catch (error) {
      console.error("❌ Error generating daily quiz:", error);
      throw error;
    }
  }
);

/**
 * Generate quiz questions using Ollama
 */
async function generateQuizWithOllama(
  subject: string,
  difficulty: string
): Promise<{ questions: DailyQuiz["questions"] }> {
  try {
    const prompt = `
Generate a multiple choice quiz about "${subject}" with difficulty level "${difficulty}".

Create exactly 5 questions in this JSON format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Important:
- correctAnswer is the index (0-3) of the correct option
- Make questions appropriate for the ${difficulty} level
- Questions should be technical and specific to ${subject}
- Ensure variety in question types
- Return ONLY valid JSON, no markdown formatting

Difficulty guidelines:
- easy: Basic concepts and definitions
- medium: Application and understanding
- hard: Analysis and advanced concepts
`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "mistral",
        prompt: prompt,
        stream: false,
        temperature: 0.7,
      },
      {
        timeout: 60000,
      }
    );

    const responseText = response.data.response;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not find JSON in response");
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate the response structure
    if (
      !parsedResponse.questions ||
      !Array.isArray(parsedResponse.questions) ||
      parsedResponse.questions.length === 0
    ) {
      throw new Error("Invalid quiz format from AI");
    }

    // Ensure exactly 5 questions
    const questions = parsedResponse.questions.slice(0, 5);

    // Validate each question
    const validatedQuestions = questions
      .filter(
        (q: any) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctAnswer === "number" &&
          q.correctAnswer >= 0 &&
          q.correctAnswer < 4
      )
      .map((q: any) => ({
        question: String(q.question).trim(),
        options: q.options.map((o: any) => String(o).trim()),
        correctAnswer: Number(q.correctAnswer),
      }));

    if (validatedQuestions.length < 5) {
      throw new Error(
        `Expected 5 questions, got ${validatedQuestions.length}`
      );
    }

    return { questions: validatedQuestions };
  } catch (error) {
    console.error("Error with Ollama API:", error);
    // Fallback to mock quiz if Ollama fails
    return generateMockQuiz(subject, difficulty);
  }
}

/**
 * Fallback mock quiz generator
 */
function generateMockQuiz(
  subject: string,
  difficulty: string
): { questions: DailyQuiz["questions"] } {
  const mockQuestions: { [key: string]: DailyQuiz["questions"] } = {
    "Data Structures": [
      {
        question:
          "What is the time complexity of searching in a binary search tree?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 1,
      },
      {
        question: "Which data structure is used for BFS traversal?",
        options: ["Stack", "Queue", "Linked List", "Array"],
        correctAnswer: 1,
      },
      {
        question: "What is the maximum number of nodes in a complete binary tree?",
        options: ["2^n - 1", "2^(n-1)", "n", "n-1"],
        correctAnswer: 0,
      },
      {
        question:
          "Which operation is NOT supported in O(1) time in a hash table?",
        options: ["Insert", "Delete", "Search", "Range Search"],
        correctAnswer: 3,
      },
      {
        question:
          "What is the space complexity of the merge sort algorithm?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 2,
      },
    ],
    Algorithms: [
      {
        question:
          "What is the time complexity of the quicksort algorithm in the worst case?",
        options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
        correctAnswer: 1,
      },
      {
        question:
          "Which sorting algorithm is stable and works in O(n) time for certain inputs?",
        options: ["Quicksort", "Mergesort", "Counting Sort", "Heapsort"],
        correctAnswer: 2,
      },
      {
        question:
          "What algorithm is used to find the shortest path in a weighted graph?",
        options: ["DFS", "BFS", "Dijkstra's", "Floyd-Warshall"],
        correctAnswer: 2,
      },
      {
        question: "What is the greedy strategy used in Kruskal's algorithm?",
        options: [
          "Sort edges by weight",
          "Always pick the heaviest edge",
          "Use a priority queue",
          "Random selection",
        ],
        correctAnswer: 0,
      },
      {
        question:
          "Which algorithm uses dynamic programming to solve the knapsack problem?",
        options: [
          "Greedy Algorithm",
          "Backtracking",
          "Dynamic Programming",
          "Divide and Conquer",
        ],
        correctAnswer: 2,
      },
    ],
  };

  return {
    questions:
      mockQuestions[subject] ||
      mockQuestions["Data Structures"] ||
      generateDefaultMockQuiz(),
  };
}

function generateDefaultMockQuiz(): DailyQuiz["questions"] {
  return [
    {
      question: "What does ACID stand for in database transactions?",
      options: [
        "Atomicity, Consistency, Isolation, Durability",
        "Array, Cache, Integer, Data",
        "Abstraction, Checking, Insertion, Design",
        "Authentication, Concurrency, Integrity, Distribution",
      ],
      correctAnswer: 0,
    },
    {
      question: "What is the main purpose of an index in a database?",
      options: [
        "To sort data",
        "To speed up data retrieval",
        "To compress data",
        "To encrypt data",
      ],
      correctAnswer: 1,
    },
    {
      question: "Which HTTP status code indicates a successful request?",
      options: ["200", "404", "500", "301"],
      correctAnswer: 0,
    },
    {
      question:
        "What is the difference between SQL and NoSQL databases?",
      options: [
        "SQL is relational, NoSQL is non-relational",
        "SQL is faster than NoSQL",
        "SQL doesn't support transactions",
        "NoSQL can't handle big data",
      ],
      correctAnswer: 0,
    },
    {
      question: "What is the purpose of encapsulation in OOP?",
      options: [
        "To hide internal details and control access",
        "To speed up code execution",
        "To reduce memory usage",
        "To improve network performance",
      ],
      correctAnswer: 0,
    },
  ];
}
