import type { Timestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  username: string; // mandatory, unique handle
  avatarUrl?: string; // URL to the user's selected avatar
  bio?: string;
  coins: number;
  lastBonusClaimed: Timestamp | null;
  loginStreak: number;
  lastLoginDate: Timestamp | null;
  quizStreaks: Partial<Record<QuizCategory, number>>;
  lastQuizDates: Partial<Record<QuizCategory, Timestamp | null>>;
  badges: string[];
  totalQuizCorrect: Partial<Record<QuizCategory, number>>;
  perfectDays: number; // Days with all quizzes completed correctly
  perfectWeeks: number;
  totalQuizzesTaken: number;
  rank?: number; // User's rank on the leaderboard
  perfectMonths: number;
  totalStudyMinutes?: number;
  totalStudySessions?: number;
  emailVerified?: boolean;
  activeCustomizations?: {
    theme?: string;
    avatar?: string;
    title?: string;
    profileFrame?: string;
  };
  createdAt: Timestamp;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  timestamp: Timestamp;
  type: 'credit' | 'debit';
  category?: 'bonus' | 'quiz' | 'penalty' | 'badge' | 'welcome' | 'study_session';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  price?: number; // For purchasable badges
  requirement?: {
    type: 'streak' | 'perfect' | 'coins' | 'study_minutes' | 'study_sessions';
    category?: 'login' | 'math' | 'aptitude' | 'grammar' | 'programming' | 'daily' | 'weekly' | 'monthly' | 'total';
    value: number;
  };
  icon: string;
  color: string;
}

export interface QuizQuestion {
  id: string;
  category: QuizCategory | 'custom';
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hint?: string;
}

export interface QuizResult {
  id: string;
  userId: string;
  category: QuizCategory;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  coinsEarned: number;
  timestamp: Timestamp;
  questions: QuizQuestion[];
  userAnswers: number[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'leaderboard' | 'penalty' | 'achievement' | 'reminder';
  read: boolean;
  timestamp: Timestamp;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  coins: number;
  badges: string[];
  rank: number;
  previousRank?: number;
}

export type QuizCategory = 'ds_algo' | 'database' | 'os' | 'networks' | 'math' | 'aptitude' | 'grammar' | 'programming';

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  coinsEarned: number;
  quizzesTaken: number;
  loginBonus: number;
  penalties: number;
  transactions: Array<{
    amount: number;
    type: 'credit' | 'debit';
    category?: 'bonus' | 'quiz' | 'penalty' | 'badge' | 'welcome';
    description: string;
    timestamp: Date | { toDate: () => Date };
  }>;
}

export type ShopItemCategory = 'booster' | 'visual' | 'profile' | 'avatar';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ShopItemCategory;
  icon: string;
  imageUrl?: string;
  stock?: number; // For limited items, undefined = unlimited
  metadata?: {
    // For boosters
    duration?: number;
    multiplier?: number;

    // For visual customizations
    themeColors?: Record<string, string>;

    // Generic
    [key: string]: unknown;
  };
  createdAt?: Timestamp;
}

export interface Purchase {
  id: string;
  userId: string;
  itemId: string;
  itemName: string;
  price: number;
  purchasedAt: Timestamp;
  usedCount?: number; // For consumable items
  maxUses?: number; // For consumable items
  active?: boolean; // For items that can be activated/deactivated
}

export interface UserInventory {
  purchases: string[]; // Array of purchased item IDs
  activeCustomizations?: {
    theme?: string;
    avatar?: string;
    title?: string;
    profileFrame?: string;
  };
  activeBooters?: {
    quizMultiplier?: {
      itemId: string;
      usesRemaining: number;
    };
    hints?: {
      itemId: string;
      hintsRemaining: number;
    };
  };
}

