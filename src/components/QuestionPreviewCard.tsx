"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, BrainCircuit, BookOpen, Code } from "lucide-react";

interface QuestionPreview {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'math' | 'aptitude' | 'grammar' | 'programming';
}

type CategoryType = 'math' | 'aptitude' | 'grammar' | 'programming';

const categoryConfig = {
  math: {
    title: 'Math Questions Preview',
    icon: Calculator,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  aptitude: {
    title: 'Aptitude Questions Preview',
    icon: BrainCircuit,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  grammar: {
    title: 'Grammar Questions Preview',
    icon: BookOpen,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  programming: {
    title: 'Programming Questions Preview',
    icon: Code,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
};

const questionPreviews: Record<CategoryType, QuestionPreview[]> = {
  math: [
    {
      id: '1',
      question: 'What is 15% of 200?',
      difficulty: 'easy',
      category: 'math'
    },
    {
      id: '2',
      question: 'Solve: 2x² - 8 = 0',
      difficulty: 'medium',
      category: 'math'
    },
    {
      id: '3',
      question: 'What is the derivative of x³?',
      difficulty: 'hard',
      category: 'math'
    },
    {
      id: '4',
      question: 'What is the area of a circle with radius 4?',
      difficulty: 'medium',
      category: 'math'
    },
    {
      id: '5',
      question: 'If sin(θ) = 3/5, what is cos(θ)?',
      difficulty: 'hard',
      category: 'math'
    }
  ],
  aptitude: [
    {
      id: '1',
      question: 'If BOOK is coded as CPPL, how is WORD coded?',
      difficulty: 'medium',
      category: 'aptitude'
    },
    {
      id: '2',
      question: 'Complete the series: 2, 6, 12, 20, ?',
      difficulty: 'medium',
      category: 'aptitude'
    },
    {
      id: '3',
      question: 'A train travels 60 km in 45 minutes. What is its speed?',
      difficulty: 'easy',
      category: 'aptitude'
    },
    {
      id: '4',
      question: 'What comes next: A1, C3, E5, G7, ?',
      difficulty: 'medium',
      category: 'aptitude'
    },
    {
      id: '5',
      question: 'If a cube is painted and cut into 27 cubes, how many have 2 painted faces?',
      difficulty: 'hard',
      category: 'aptitude'
    }
  ],
  grammar: [
    {
      id: '1',
      question: 'What is the past participle of "swim"?',
      difficulty: 'easy',
      category: 'grammar'
    },
    {
      id: '2',
      question: 'Choose the correct form: "I wish I _____ taller."',
      difficulty: 'medium',
      category: 'grammar'
    },
    {
      id: '3',
      question: 'Which sentence uses the subjunctive mood correctly?',
      difficulty: 'hard',
      category: 'grammar'
    },
    {
      id: '4',
      question: 'Identify the type of sentence: "What a beautiful day!"',
      difficulty: 'easy',
      category: 'grammar'
    },
    {
      id: '5',
      question: 'Choose the sentence with correct parallelism.',
      difficulty: 'hard',
      category: 'grammar'
    }
  ],
  programming: [
    {
      id: '1',
      question: 'What does "HTML" stand for?',
      difficulty: 'easy',
      category: 'programming'
    },
    {
      id: '2',
      question: 'What is the time complexity of binary search?',
      difficulty: 'medium',
      category: 'programming'
    },
    {
      id: '3',
      question: 'In Python, what does the "yield" keyword do?',
      difficulty: 'hard',
      category: 'programming'
    },
    {
      id: '4',
      question: 'Which of these is NOT a JavaScript data type?',
      difficulty: 'easy',
      category: 'programming'
    },
    {
      id: '5',
      question: 'What is memoization in dynamic programming?',
      difficulty: 'hard',
      category: 'programming'
    }
  ]
};

const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'hard':
      return 'bg-red-100 text-red-800';
  }
};

interface QuestionPreviewCardProps {
  category: CategoryType;
}

export function QuestionPreviewCard({ category }: QuestionPreviewCardProps) {
  const config = categoryConfig[category];
  const questions = questionPreviews[category];
  const IconComponent = config.icon;

  return (
    <Card className={`${config.bgColor} border ${config.borderColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <IconComponent className={`h-4 w-4 ${config.color}`} />
          <div>
            <CardTitle className="text-base">{config.title}</CardTitle>
            <CardDescription className="text-[10px]">Sample questions from this category</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {questions.map((question) => (
          <div key={question.id} className="bg-white rounded-md p-2 border border-gray-200">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-xs font-medium text-gray-800 flex-1 leading-snug">
                {question.question}
              </p>
              <Badge className={`shrink-0 text-[9px] h-4 px-1.5 ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </Badge>
            </div>
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mt-2">
          <p className="text-[10px] font-semibold text-blue-900 mb-0.5">📊 Stats</p>
          <p className="text-[10px] text-blue-800">
            Total: <span className="font-bold">15 questions</span> • E: 5 • M: 5 • H: 5
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function AllQuestionsPreview() {
  const categories: CategoryType[] = ['math', 'aptitude', 'grammar', 'programming'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <QuestionPreviewCard key={category} category={category} />
      ))}
    </div>
  );
}
