import { QuizQuestion, QuizCategory } from './types';

export const getMockQuestions = (category: QuizCategory): QuizQuestion[] => {
  return [
    {
      id: "mock_" + category + "_1",
      category: category,
      question: "What is the primary function of " + category + "?",
      options: [
        "To manage data efficiently",
        "To provide a user interface",
        "To act as a central processing unit",
        "To handle network requests"
      ],
      correctAnswer: 0,
      difficulty: "easy",
      points: 10,
      hint: "Think about the core concept of this subject."
    },
    {
      id: "mock_" + category + "_2",
      category: category,
      question: "Which of the following describes " + category + " best?",
      options: [
        "A structured methodology",
        "A random process",
        "A hardware component",
        "A networking protocol"
      ],
      correctAnswer: 0,
      difficulty: "medium",
      points: 20,
      hint: "It relates to a systematic approach."
    },
    {
      id: "mock_" + category + "_3",
      category: category,
      question: "How does " + category + " deal with complexity?",
      options: [
        "By ignoring it",
        "By abstracting it",
        "By duplicating it",
        "By increasing it"
      ],
      correctAnswer: 1,
      difficulty: "hard",
      points: 30,
      hint: "Consider how models represent reality."
    }
  ];
};
