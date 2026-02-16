"use client";

import { useState } from 'react';
import { QuizCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Network, Database, Cpu, BinaryIcon, Clock, Coins, Sparkles, Trophy, Target, Award, Calculator, Brain, Book, Code } from 'lucide-react';
import { EnhancedQuizModal } from './EnhancedQuizModal';

const categoryData = {
  ds_algo: {
    icon: BinaryIcon,
    title: 'Data Structures & Algorithms',
    description: 'Master arrays, trees, graphs, sorting, and complexity analysis.',
    gradient: 'from-blue-500 to-cyan-500',
    difficulty: 'hard',
    timeLimit: 180 // 3 minutes for 15 questions
  },
  database: {
    icon: Database,
    title: 'Database Management',
    description: 'Test your knowledge of SQL, normalization, ACID, and database design.',
    gradient: 'from-purple-500 to-indigo-500',
    difficulty: 'medium',
    timeLimit: 150 // 2.5 minutes
  },
  os: {
    icon: Cpu,
    title: 'Operating Systems',
    description: 'Explore processes, memory management, scheduling, and deadlocks.',
    gradient: 'from-emerald-500 to-teal-500',
    difficulty: 'hard',
    timeLimit: 180 // 3 minutes
  },
  networks: {
    icon: Network,
    title: 'Computer Networks',
    description: 'Learn about protocols, OSI model, TCP/IP, and network security.',
    gradient: 'from-orange-500 to-amber-500',
    difficulty: 'medium',
    timeLimit: 150 // 2.5 minutes
  },
  math: {
    icon: Calculator,
    title: 'Mathematics',
    description: 'Algebra, Geometry, Calculus, and Statistics.',
    gradient: 'from-yellow-500 to-amber-500',
    difficulty: 'hard',
    timeLimit: 180
  },
  aptitude: {
    icon: Brain,
    title: 'General Aptitude',
    description: 'Logical reasoning, puzzles, and problem solving.',
    gradient: 'from-pink-500 to-rose-500',
    difficulty: 'medium',
    timeLimit: 150
  },
  grammar: {
    icon: Book,
    title: 'English Grammar',
    description: 'Vocabulary, syntax, comprehension, and usage.',
    gradient: 'from-teal-500 to-emerald-500',
    difficulty: 'easy',
    timeLimit: 120
  },
  programming: {
    icon: Code,
    title: 'Programming',
    description: 'General coding concepts, syntax, and logic.',
    gradient: 'from-slate-500 to-gray-500',
    difficulty: 'medium',
    timeLimit: 150
  }
};

interface QuizCategoryCardsProps {
  onQuizComplete: (category: QuizCategory, score: number, coinsEarned: number, totalQuestions?: number, correctAnswers?: number) => void;
  userStreaks?: Partial<Record<QuizCategory, number>>;
  lastQuizDates?: Partial<Record<QuizCategory, Date | null>>;
  quizResults?: Partial<Record<QuizCategory, { score: number; coinsEarned: number; correctAnswers: number; totalQuestions: number; timestamp: Date } | null>>;
}

export function QuizCategoryCards({ onQuizComplete, userStreaks, lastQuizDates, quizResults }: QuizCategoryCardsProps) {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [viewingResults, setViewingResults] = useState<QuizCategory | null>(null);

  const canTakeQuiz = (category: QuizCategory) => {
    const lastDate = lastQuizDates?.[category];
    if (!lastDate) return true;

    const today = new Date().toDateString();
    return lastDate.toDateString() !== today;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-white/5 border-emerald-500/20 text-emerald-500';
      case 'medium': return 'bg-white/5 border-amber-500/20 text-amber-500';
      case 'hard': return 'bg-white/5 border-rose-500/20 text-rose-500';
      default: return 'bg-white/5 border-white/10 text-muted-foreground';
    }
  };

  const formatTimeLimit = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  const formatDifficulty = (difficulty: string) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Object.entries(categoryData).map(([key, data]) => {
          const category = key as QuizCategory;
          
          const IconComponent = data.icon;
          const streak = userStreaks?.[category] || 0;
          const canTake = canTakeQuiz(category);

          return (
            <div
              key={category}
              className="group relative overflow-hidden rounded-[1.8rem] md:rounded-[2.2rem] p-0.5 transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent cursor-pointer"
              onClick={() => canTake && setSelectedCategory(category)}
            >
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative h-full bg-card/40 backdrop-blur-3xl rounded-[1.7rem] md:rounded-[2.1rem] p-5 md:p-6 lg:p-8 flex flex-col gap-4 md:gap-6 shadow-2xl border border-white/5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br ${data.gradient} shadow-2xl ring-1 ring-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                    <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className={`px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] border shadow-lg ${getDifficultyColor(data.difficulty)}`}>
                    {formatDifficulty(data.difficulty)}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-1.5 md:space-y-2">
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors duration-500">
                    {data.title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground/80 font-bold uppercase tracking-[0.1em] leading-relaxed line-clamp-2">
                    {data.description}
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 md:gap-3 mt-auto">
                  <div className="flex flex-col gap-0.5 p-2.5 md:p-3 bg-white/5 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
                    <Coins className="h-3 w-3 text-primary" />
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground">REWARD</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-foreground">75 Coins</span>
                  </div>
                  <div className="flex flex-col gap-0.5 p-2.5 md:p-3 bg-white/5 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/5 group-hover:bg-accent/5 group-hover:border-accent/20 transition-all duration-500">
                    <Clock className="h-3 w-3 text-accent" />
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] text-muted-foreground">TIME</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-foreground">{formatTimeLimit(data.timeLimit)}</span>
                  </div>
                </div>

                {/* Streak Badge */}
                {streak > 0 && (
                  <div className="flex items-center justify-center -mb-1">
                    <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      {streak} DAY STREAK
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canTake) {
                      setSelectedCategory(category);
                    } else {
                      setViewingResults(category);
                    }
                  }}
                  className={`w-full h-12 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[9px] md:text-[10px] transition-all duration-700 shadow-xl ${
                    canTake
                      ? `bg-gradient-to-r ${data.gradient} hover:shadow-2xl hover:shadow-primary/40 text-white border-0 hover:scale-[1.02] active:scale-95`
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-muted-foreground hover:bg-white/10'
                  }`}
                >
                  {canTake ? (
                    <div className="flex items-center gap-2">
                      <Target className="h-3.5 w-3.5" />
                      START CHALLENGE
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5" />
                      VIEW PERFORMANCE
                    </div>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCategory && (
        <EnhancedQuizModal
          isOpen={!!selectedCategory}
          onClose={() => setSelectedCategory(null)}
          category={selectedCategory}
          onQuizComplete={(category, score, coinsEarned, totalQuestions = 15, correctAnswers = 0) => {
            onQuizComplete(category, score, coinsEarned, totalQuestions, correctAnswers);
            setSelectedCategory(null);
          }}
        />
      )}

      {viewingResults && quizResults?.[viewingResults] && (
        <Dialog open={!!viewingResults} onOpenChange={() => setViewingResults(null)}>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full bg-card/70 backdrop-blur-2xl border-white/20 rounded-[2rem] md:rounded-[3rem] p-0 overflow-y-auto max-h-[90vh] shadow-2xl">
            <div className="relative p-6 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
              
              <div className="relative space-y-8 md:space-y-12">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 md:w-24 md:h-24 mx-auto rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-primary via-primary to-accent p-0.5 shadow-2xl rotate-3">
                    <div className="w-full h-full bg-card/60 backdrop-blur-xl rounded-[1.4rem] md:rounded-[1.9rem] flex items-center justify-center">
                      <Award className="h-8 w-8 md:h-12 md:w-12 text-primary" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <DialogTitle className="text-xl md:text-3xl font-black uppercase tracking-[0.2em] text-foreground">
                    Quiz Results
                  </DialogTitle>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                      {categoryData[viewingResults].title}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                  {[
                    { label: 'Score', value: `${Number(quizResults[viewingResults]!.score).toFixed(2)}%`, icon: Target, color: 'text-primary' },
                    { label: 'Correct', value: `${quizResults[viewingResults]!.correctAnswers}/${quizResults[viewingResults]!.totalQuestions}`, icon: Trophy, color: 'text-accent' },
                    { label: 'Coins', value: `+${quizResults[viewingResults]!.coinsEarned}`, icon: Coins, color: 'text-primary' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/10 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 border border-white/10 text-center space-y-2 md:space-y-3">
                      <div className="flex justify-center">
                        <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                      </div>
                      <div className="text-xl md:text-2xl font-black uppercase tracking-tighter text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] bg-white/10 border border-white/10 space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground">Completed at</span>
                    <span className="text-foreground">{quizResults[viewingResults]!.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="text-foreground">{((quizResults[viewingResults]!.correctAnswers / quizResults[viewingResults]!.totalQuestions) * 100).toFixed(0)}%</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setViewingResults(null)} 
                  className="w-full h-14 md:h-16 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs bg-primary text-white hover:shadow-2xl hover:shadow-primary/40 transition-all duration-700 hover:scale-[1.02] active:scale-95"
                >
                  Close Results
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
