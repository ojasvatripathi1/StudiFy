import type { Timestamp } from 'firebase/firestore';

export type SubjectType = 'mathematics' | 'programming' | 'grammar' | 'aptitude' | 'general' | 'custom';

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface StudySession {
  id: string;
  userId: string;
  subject: SubjectType;
  title: string;
  description?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration: number; // in seconds
  plannedDuration?: number; // in seconds
  status: SessionStatus;
  notes?: string;
  focusLevel?: number; // 1-10 scale
  productivity?: number; // 1-10 scale
  distractions?: string[];
  topics?: string[];
  achievements?: string[];
  breaks: {
    count: number;
    totalBreakTime: number; // in seconds
  };
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SessionInsight {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Timestamp;
  
  // Aggregated metrics
  totalSessions: number;
  totalStudyTime: number; // in hours
  averageSessionDuration: number; // in minutes
  averageFocusLevel: number; // 1-10
  averageProductivity: number; // 1-10
  
  // Subject breakdown
  subjectStats: {
    [key in SubjectType]?: {
      sessions: number;
      totalTime: number; // in hours
      averageFocusLevel: number;
      averageProductivity: number;
    };
  };
  
  // Trends
  improvements: string[];
  challenges: string[];
  recommendations: string[];
  
  // Best performing times
  bestTimeOfDay?: {
    hour: number;
    focusLevel: number;
    productivity: number;
  };
  
  // Break analysis
  avgBreaksPerSession: number;
  avgBreakDuration: number; // in minutes
  
  // Trends and patterns
  consistencyScore: number; // 0-100
  improvementTrend: 'improving' | 'stable' | 'declining';
  
  generatedBy: 'ai' | 'system';
  createdAt: Timestamp;
}

export interface SessionBreak {
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // in seconds
  reason?: string;
}

export interface AINoteAnalysis {
  summary: string;
  keyTopics: string[];
  learningOutcomes: string[];
  suggestedFollowUp: string[];
  focusAreas: string[];
  confidence: number; // 0-100
}
