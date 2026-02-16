// Run this script to initialize sample quiz questions and badges in Firebase
// Usage: npx tsx src/scripts/initializeData.ts

import { config } from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch, getDocs } from "firebase/firestore";
import { QuizQuestion, Badge } from "../lib/types";

// Load environment variables from .env.local first, then .env
config({ path: '.env.local' });
config({ path: '.env' });

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.log('Please create a .env.local file with your Firebase configuration.');
    process.exit(1);
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleQuestions: Omit<QuizQuestion, 'id'>[] = [
  // ============ MATH QUESTIONS (15 Questions) ============
  // Easy
  {
    category: 'math',
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'math',
    question: 'If x + 5 = 12, what is the value of x?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'math',
    question: 'What is 3⁴?',
    options: ['12', '64', '81', '27'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'math',
    question: 'What is the value of √144?',
    options: ['10', '11', '12', '13'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'math',
    question: 'What is 25% of 80?',
    options: ['15', '20', '25', '30'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  // Medium
  {
    category: 'math',
    question: 'What is the area of a circle with radius 4?',
    options: ['12π', '16π', '8π', '4π'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'math',
    question: 'Solve: 2x² - 8 = 0',
    options: ['x = ±2', 'x = ±4', 'x = ±1', 'x = ±3'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'math',
    question: 'If 2x - 3 = 7, what is x?',
    options: ['4', '5', '6', '7'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'math',
    question: 'What is the perimeter of a square with side 5?',
    options: ['10', '15', '20', '25'],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'math',
    question: 'What is the sum of angles in a triangle?',
    options: ['90°', '180°', '270°', '360°'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  // Hard
  {
    category: 'math',
    question: 'What is the derivative of x³?',
    options: ['x²', '2x²', '3x²', '4x²'],
    correctAnswer: 2,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'math',
    question: 'Solve: x² - 5x + 6 = 0',
    options: ['x = 2 or x = 3', 'x = 1 or x = 6', 'x = 0 or x = 5', 'x = 2 or x = 4'],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'math',
    question: 'What is the limit of (x² - 1)/(x - 1) as x approaches 1?',
    options: ['0', '1', '2', 'Undefined'],
    correctAnswer: 2,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'math',
    question: 'What is ∫x² dx?',
    options: ['x³ + C', 'x³/3 + C', '2x + C', 'x³/2 + C'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'math',
    question: 'If sin(θ) = 3/5, what is cos(θ) (assuming θ is acute)?',
    options: ['3/5', '4/5', '5/4', '2/5'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },

  // ============ APTITUDE QUESTIONS (15 Questions) ============
  // Easy
  {
    category: 'aptitude',
    question: 'A train travels 60 km in 45 minutes. What is its speed in km/h?',
    options: ['75', '80', '85', '90'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'If 3 pens cost Rs. 30, how much do 12 pens cost?',
    options: ['Rs. 100', 'Rs. 120', 'Rs. 140', 'Rs. 150'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'What comes next: 1, 4, 9, 16, ?',
    options: ['20', '24', '25', '30'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'If A is the father of B and B is the father of C, what is C to A?',
    options: ['Son', 'Brother', 'Grandson', 'Father'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'What number comes next: 2, 4, 8, 16, ?',
    options: ['24', '28', '32', '36'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  // Medium
  {
    category: 'aptitude',
    question: 'If BOOK is coded as CPPL, how is WORD coded?',
    options: ['XPSE', 'XQSE', 'YPSE', 'XPSD'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'Complete the series: 2, 6, 12, 20, ?',
    options: ['28', '30', '32', '34'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'What comes next in the pattern: A1, C3, E5, G7, ?',
    options: ['H8', 'I9', 'J10', 'K11'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'If you rearrange the letters of "TEAM", which word cannot be formed?',
    options: ['MEAT', 'MATE', 'TAME', 'STEAM'],
    correctAnswer: 3,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'A man walks 5 km North, then 3 km East, then 5 km South. How far is he from the starting point?',
    options: ['2 km', '3 km', '5 km', '8 km'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  // Hard
  {
    category: 'aptitude',
    question: 'If all roses are flowers and some flowers are red, which conclusion is correct?',
    options: ['All roses are red', 'Some roses are red', 'No roses are red', 'Cannot be determined'],
    correctAnswer: 3,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'A, B, C are sitting in a row. B is to the right of A. C is to the left of B. Who is in the middle?',
    options: ['A', 'B', 'C', 'Cannot be determined'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'Complete the analogy: Cat is to Meow as Dog is to ?',
    options: ['Bark', 'Purr', 'Hiss', 'Roar'],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'If a cube is painted on all sides and then cut into 27 equal smaller cubes, how many will have exactly two painted faces?',
    options: ['8', '12', '20', '18'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'Find the missing number: 1, 1, 2, 3, 5, 8, 13, ?',
    options: ['18', '20', '21', '23'],
    correctAnswer: 2,
    difficulty: 'hard',
    points: 5
  },

  // ============ GRAMMAR QUESTIONS (15 Questions) ============
  // Easy
  {
    category: 'grammar',
    question: 'What is the past participle of "swim"?',
    options: ['swam', 'swum', 'swimmed', 'swimming'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Identify the type of sentence: "What a beautiful day!"',
    options: ['Declarative', 'Interrogative', 'Imperative', 'Exclamatory'],
    correctAnswer: 3,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Which is the correct spelling?',
    options: ['Recieve', 'Receive', 'Reciee', 'Recieve'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'grammar',
    question: 'What is the plural of "child"?',
    options: ['childs', 'childes', 'children', 'childern'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Which sentence is grammatically correct?',
    options: [
      'She go to school daily',
      'She goes to school daily',
      'She going to school daily',
      'She gone to school daily'
    ],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  // Medium
  {
    category: 'grammar',
    question: 'Choose the correct sentence:',
    options: [
      'Neither John nor his friends was present.',
      'Neither John nor his friends were present.',
      'Neither John or his friends were present.',
      'Neither John and his friends were present.'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Choose the correct form: "I wish I _____ taller."',
    options: ['am', 'was', 'were', 'will be'],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Fill in the blank: "She is better at math _____ he is."',
    options: ['then', 'than', 'that', 'they'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Which is an adverb?',
    options: ['Beautiful', 'Quickly', 'Red', 'Happy'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Identify the preposition: "The book is on the table."',
    options: ['book', 'is', 'on', 'table'],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 5
  },
  // Hard
  {
    category: 'grammar',
    question: 'Which sentence uses the subjunctive mood correctly?',
    options: [
      'If I was rich, I would travel.',
      'If I were rich, I would travel.',
      'If I am rich, I would travel.',
      'If I will be rich, I would travel.'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Choose the sentence with correct parallelism:',
    options: [
      'She likes reading, writing, and to paint.',
      'She likes to read, write, and painting.',
      'She likes reading, writing, and painting.',
      'She likes to read, writing, and paint.'
    ],
    correctAnswer: 2,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Which sentence uses the correct tense sequence?',
    options: [
      'After he had left, she arrives.',
      'After he left, she arrived.',
      'After he leaves, she arrives.',
      'After he had left, she will arrive.'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Identify the phrase type: "Walking down the street"',
    options: ['Noun phrase', 'Verb phrase', 'Gerund phrase', 'Prepositional phrase'],
    correctAnswer: 2,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Which sentence has a dangling modifier?',
    options: [
      'The teacher returned the papers to the students.',
      'While reading the book, the phone rang.',
      'She ran quickly to catch the bus.',
      'After finishing homework, he went to bed.'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },

  // ============ PROGRAMMING QUESTIONS (15 Questions) ============
  // Easy
  {
    category: 'programming',
    question: 'What does "HTML" stand for?',
    options: [
      'Hypertext Markup Language',
      'High Tech Modern Language',
      'Home Tool Markup Language',
      'Hyperlink and Text Markup Language'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'programming',
    question: 'Which of these is NOT a JavaScript data type?',
    options: ['string', 'boolean', 'integer', 'undefined'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'programming',
    question: 'Which SQL command is used to retrieve data from a database?',
    options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'programming',
    question: 'What does "CSS" stand for?',
    options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Colorful Style Sheets', 'Coding Style System'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'programming',
    question: 'Which of these is a Python data type?',
    options: ['str', 'int', 'list', 'All of the above'],
    correctAnswer: 3,
    difficulty: 'easy',
    points: 5
  },
  // Medium
  {
    category: 'programming',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'programming',
    question: 'Which of these is NOT an OOP concept?',
    options: ['Polymorphism', 'Encapsulation', 'Inheritance', 'Iteration'],
    correctAnswer: 3,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'programming',
    question: 'What does "REST" stand for?',
    options: [
      'Representational State Transfer',
      'Remote Execution Service Technology',
      'Resource Enhancement Service Transfer',
      'Rapid Exchange System Technology'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'programming',
    question: 'What is a React Hook?',
    options: [
      'A way to connect components',
      'A function that lets you use state and lifecycle features',
      'A debugging tool',
      'A styling method'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'programming',
    question: 'What does the "this" keyword refer to in JavaScript?',
    options: [
      'The parent object',
      'The current object context',
      'The global window object',
      'The function itself'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  // Hard
  {
    category: 'programming',
    question: 'In Python, what does the "yield" keyword do?',
    options: [
      'Returns a value and exits the function',
      'Creates a generator function',
      'Raises an exception',
      'Imports a module'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'programming',
    question: 'What is the space complexity of a Hash Table (on average)?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'programming',
    question: 'What design pattern is used in the Singleton class?',
    options: ['Creational', 'Structural', 'Behavioral', 'All of the above'],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'programming',
    question: 'What is memoization in dynamic programming?',
    options: [
      'Storing calculations to avoid redundant work',
      'A memory leak prevention technique',
      'Caching HTML pages',
      'A JavaScript memory management tool'
    ],
    correctAnswer: 0,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'programming',
    question: 'Which of these has the best average-case time complexity for sorting?',
    options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  }
];

// Define badge data without IDs
type BaseBadge = Omit<Badge, 'id'>;

const baseBadges: BaseBadge[] = [
  // Purchasable Badges
  {
    name: 'Bronze Collector',
    description: 'A shiny bronze badge for dedicated learners',
    price: 1000,
    icon: 'award',
    color: 'amber'
  },
  {
    name: 'Silver Scholar',
    description: 'A prestigious silver badge for committed students',
    price: 2000,
    icon: 'star',
    color: 'gray'
  },
  {
    name: 'Gold Master',
    description: 'An exclusive gold badge for top performers',
    price: 5000,
    icon: 'crown',
    color: 'yellow'
  },
  {
    name: 'Platinum Elite',
    description: 'The ultimate platinum badge for StudiFy legends',
    price: 10000,
    icon: 'trophy',
    color: 'blue'
  },
  {
    name: 'Diamond Champion',
    description: 'The rarest diamond badge for true champions',
    price: 20000,
    icon: 'zap',
    color: 'purple'
  },

  // Streak Badges - Login
  {
    name: 'Early Bird',
    description: 'Login for 1 consecutive day',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 1
    },
    icon: 'target',
    color: 'green'
  },
  {
    name: 'Consistent Learner',
    description: 'Login for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 7
    },
    icon: 'target',
    color: 'blue'
  },
  {
    name: 'Dedicated Student',
    description: 'Login for 30 consecutive days',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 30
    },
    icon: 'target',
    color: 'purple'
  },
  {
    name: 'Login Legend',
    description: 'Login for 100 consecutive days',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 100
    },
    icon: 'crown',
    color: 'yellow'
  },

  // Quiz Streak Badges
  {
    name: 'Math Enthusiast',
    description: 'Complete math quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'math',
      value: 7
    },
    icon: 'zap',
    color: 'blue'
  },
  {
    name: 'Logic Master',
    description: 'Complete aptitude quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'aptitude',
      value: 7
    },
    icon: 'zap',
    color: 'purple'
  },
  {
    name: 'Grammar Guru',
    description: 'Complete grammar quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'grammar',
      value: 7
    },
    icon: 'zap',
    color: 'green'
  },
  {
    name: 'Code Warrior',
    description: 'Complete programming quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'programming',
      value: 7
    },
    icon: 'zap',
    color: 'orange'
  },

  // Perfect Score Badges
  {
    name: 'Perfect Day',
    description: 'Score 100% on all quiz categories in one day',
    requirement: {
      type: 'perfect',
      category: 'daily',
      value: 1
    },
    icon: 'star',
    color: 'yellow'
  },
  {
    name: 'Perfect Week',
    description: 'Score 100% on all quizzes for 7 consecutive days',
    requirement: {
      type: 'perfect',
      category: 'weekly',
      value: 7
    },
    icon: 'crown',
    color: 'purple'
  },
  {
    name: 'Perfect Month',
    description: 'Score 100% on all quizzes for 30 consecutive days',
    requirement: {
      type: 'perfect',
      category: 'monthly',
      value: 30
    },
    icon: 'trophy',
    color: 'gold'
  }
];

async function initializeQuestions() {
  console.log('Initializing quiz questions...');
  
  for (const question of sampleQuestions) {
    const docRef = doc(collection(db, 'quizQuestions'));
    await setDoc(docRef, question);
  }
  
  console.log(`✅ Added ${sampleQuestions.length} quiz questions`);
}

const initializeBadges = async () => {
  try {
    const batch = writeBatch(db);
    const badgesRef = collection(db, 'badges');
    
    // First, check if badges already exist
    const snapshot = await getDocs(badgesRef);
    if (!snapshot.empty) {
      console.log('Deleting existing badges before reinitialization...');
      // Delete existing badges to avoid duplicates
      const deleteBatch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
    }

    console.log('Initializing badges...');
    
    // Add each badge with its ID as the document ID
    const badgesToCreate = baseBadges.map((badge, index) => ({
      id: `badge-${index + 1}`,
      ...badge
    }));
    
    badgesToCreate.forEach(badge => {
      const badgeRef = doc(db, 'badges', badge.id);
      batch.set(badgeRef, {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        price: badge.price || 0,
        icon: badge.icon || 'award',
        color: badge.color || 'gray',
        ...(badge.requirement && { requirement: badge.requirement }),
        createdAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
    console.log(`✅ Successfully initialized ${badgesToCreate.length} badges`);
  } catch (error) {
    console.error('❌ Error initializing badges:', error);
    throw error;
  }
};

async function main() {
  try {
    console.log('🚀 Starting StudiFy data initialization...');
    
    await initializeQuestions();
    await initializeBadges();
    
    console.log('🎉 StudiFy data initialization completed successfully!');
    console.log('\nYour StudiFy app now has:');
    console.log(`- ${sampleQuestions.length} quiz questions across 4 categories`);
    console.log('\nUsers can now:');
    console.log('- Take daily quizzes in Math, Aptitude, Grammar, and Programming');
    console.log('- Earn coins and maintain streaks');
    console.log('- Purchase badges and earn achievement badges');
    console.log('- View analytics and receive notifications');
    
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
}

main();
