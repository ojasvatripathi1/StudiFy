'use client';

import { useState, useEffect, useCallback } from 'react';
import { Zap, Clock, Award, ChevronRight, CheckCircle2, Lock, Coins, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

interface DailyQuizData {
  id: string;
  date: string;
  subject: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface UserDailyQuizProgress {
  quizDate: string;
  completed: boolean;
  score: number;
  totalQuestions: number;
  coinsEarned: number;
  completedAt: Timestamp;
}

const COIN_REWARD_PER_QUESTION = 10;
const difficultyMultiplier: { [key: string]: number } = {
  easy: 1,
  medium: 1.5,
  hard: 2,
};

const DAILY_QUIZ_TOPICS = [
  'Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks', 
  'Database Management Systems', 'Software Engineering', 'Artificial Intelligence',
  'Web Development', 'Cyber Security', 'Cloud Computing', 'Machine Learning',
  'Discrete Mathematics', 'Digital Logic Design', 'Computer Architecture'
];

export function DailyQuizCard() {
  const { user } = useAuth();
  const [dailyQuiz, setDailyQuiz] = useState<DailyQuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [userProgress, setUserProgress] = useState<UserDailyQuizProgress | null>(null);

  // Quiz taking states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadDailyQuiz = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Check if today's quiz already exists in Firestore
      const quizRef = doc(db, 'dailyQuizzes', today);
      const quizSnap = await getDoc(quizRef);
      
      let quizData: DailyQuizData;
      
      // Check if the existing quiz has the "All A" problem (too many correct answers at index 0)
      let needsRegeneration = false;
      if (quizSnap.exists()) {
        const data = quizSnap.data();
        const correctAs = data.questions.filter((q: { correctAnswer: number }) => q.correctAnswer === 0).length;
        if (correctAs === data.questions.length && data.questions.length > 1) {
          console.log('Detected "All A" quiz, forcing regeneration...');
          needsRegeneration = true;
        }
      }

      if (quizSnap.exists() && !needsRegeneration) {
        const data = quizSnap.data();
        quizData = {
          id: today,
          date: data.date,
          subject: data.subject,
          difficulty: data.difficulty,
          questions: data.questions
        };
        console.log('Daily quiz loaded from Firestore');
      } else {
        // 2. Generate new quiz if it doesn't exist or was broken
        console.log(needsRegeneration ? 'Regenerating broken quiz...' : 'No daily quiz found, generating new one...');
        
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const selectedTopic = DAILY_QUIZ_TOPICS[dayOfYear % DAILY_QUIZ_TOPICS.length];
        
        const response = await fetch(`/api/daily-quiz?topic=${encodeURIComponent(selectedTopic)}&difficulty=medium&t=${Date.now()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to generate daily quiz');
        }
        
        const generatedData = await response.json();
        
        // 3. Shuffle options for each question to be extra safe
        const shuffledQuestions = generatedData.questions.map((q: { options: string[], question: string, correctAnswer: number }) => {
          const optionsWithIndices = (q.options).map((opt: string, i: number) => ({ opt, i }));
          // Better shuffle
          for (let i = optionsWithIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsWithIndices[i], optionsWithIndices[j]] = [optionsWithIndices[j], optionsWithIndices[i]];
          }
          
          return {
            question: q.question,
            options: optionsWithIndices.map(s => s.opt),
            correctAnswer: optionsWithIndices.findIndex(s => s.i === q.correctAnswer)
          };
        });

        // 4. Save the newly generated quiz to Firestore
        quizData = {
          id: today,
          date: today,
          subject: generatedData.topic,
          difficulty: generatedData.difficulty,
          questions: shuffledQuestions
        };
        
        try {
          await setDoc(quizRef, {
            ...quizData,
            createdAt: Timestamp.now()
          }, { merge: true });
          console.log('New daily quiz saved to Firestore');
        } catch (saveErr) {
          console.warn('Failed to save generated quiz to Firestore:', saveErr);
        }
      }
      
      setDailyQuiz(quizData);

      // 5. Check if user has already completed today's quiz
      const userProgressRef = doc(db, `users/${user.uid}/dailyQuizzes`, today);
      const progressDoc = await getDoc(userProgressRef);
      if (progressDoc.exists()) {
        setUserProgress(progressDoc.data() as UserDailyQuizProgress);
      }
    } catch (err: unknown) {
      console.error('Error loading daily quiz:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDailyQuiz();
  }, [loadDailyQuiz]);

  const handlePlayQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsFinished(false);
    setShowQuizModal(true);
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNextQuestion = () => {
    if (dailyQuiz && selectedAnswer !== null) {
      const currentQuestion = dailyQuiz.questions[currentQuestionIndex];
      if (selectedAnswer === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 1);
      }

      setSelectedAnswer(null);

      if (currentQuestionIndex < dailyQuiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setIsFinished(true);
      }
    }
  };

  const handleFinishQuiz = async () => {
    if (!user || !dailyQuiz) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const multiplier = difficultyMultiplier[dailyQuiz.difficulty] || 1;
      const finalCoinsEarned = Math.floor(
        score * COIN_REWARD_PER_QUESTION * multiplier
      );

      console.log(`Finishing quiz: Score=${score}, Multiplier=${multiplier}, Coins=${finalCoinsEarned}`);

      // Save user's quiz progress
      const userProgressRef = doc(db, `users/${user.uid}/dailyQuizzes`, today);
      const progressData: UserDailyQuizProgress = {
        quizDate: today,
        completed: true,
        score,
        totalQuestions: dailyQuiz.questions.length,
        coinsEarned: finalCoinsEarned,
        completedAt: Timestamp.now(),
      };

      await setDoc(userProgressRef, progressData);

      // Update user's total coins
      console.log('Attempting to update coins for user:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentCoins = Number(userData.coins || 0);
        const newCoins = currentCoins + finalCoinsEarned;
        
        console.log(`Firestore Balance Update: ${currentCoins} + ${finalCoinsEarned} = ${newCoins}`);
        
        const { writeBatch } = await import('firebase/firestore');
        const batch = writeBatch(db);
        
        // 1. Update user total coins
        batch.update(userRef, { 
          coins: newCoins,
          updatedAt: Timestamp.now()
        });
        
        // 2. Add transaction record to the user's subcollection
        const transactionsRef = collection(db, 'users', user.uid, 'transactions');
        const transactionDocRef = doc(transactionsRef);
        batch.set(transactionDocRef, {
          type: 'credit',
          amount: finalCoinsEarned,
          description: `Daily Quiz: ${dailyQuiz.subject}`,
          date: Timestamp.now(),
          timestamp: Timestamp.now(),
          source: 'daily_quiz',
          quizDate: today,
          category: 'quiz'
        });

        await batch.commit();
        console.log('✅ Firestore update successful: Coins and Transaction recorded.');
      } else {
        console.error('❌ User document NOT FOUND at path: users/' + user.uid);
        // Fallback: try creating the user document if it doesn't exist (though it should)
        try {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            coins: finalCoinsEarned,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          }, { merge: true });
          console.log('✅ Created new user document with coins.');
        } catch (createErr) {
          console.error('❌ Failed to create fallback user document:', createErr);
        }
      }

      setUserProgress(progressData);
      setShowQuizModal(false);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] p-[1px] bg-white/5 border border-white/10">
        <div className="bg-card/40 backdrop-blur-3xl rounded-[1.9rem] p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-primary/10 rounded-lg animate-pulse" />
              <div className="h-2.5 w-16 bg-primary/5 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] p-[1px] bg-red-500/20 border border-red-500/20">
        <div className="bg-card/40 backdrop-blur-3xl rounded-[1.9rem] p-6 md:p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
            <Zap className="h-6 w-6 text-red-500 opacity-50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-red-500">Generation Failed</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-red-500/60">{error}</p>
          </div>
          <button 
            onClick={loadDailyQuiz}
            className="px-6 h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-500/20 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dailyQuiz) {
    return (
      <div className="relative overflow-hidden rounded-[2rem] p-[1px] bg-white/5 border border-white/10">
        <div className="bg-card/40 backdrop-blur-3xl rounded-[1.9rem] p-6 md:p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary opacity-40" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black uppercase tracking-tight text-foreground/60">No Daily Quiz</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Check back tomorrow!</p>
          </div>
        </div>
      </div>
    );
  }

  const isCompleted = userProgress?.completed;
  
  // Calculate current session coins
  const currentSessionCoins = dailyQuiz ? Math.floor(
    score * COIN_REWARD_PER_QUESTION * (difficultyMultiplier[dailyQuiz.difficulty] || 1)
  ) : 0;

  const coinsEarned = isCompleted ? (userProgress?.coinsEarned ?? 0) : currentSessionCoins;
  const maxCoins = Math.floor(
    dailyQuiz.questions.length *
      COIN_REWARD_PER_QUESTION *
      difficultyMultiplier[dailyQuiz.difficulty]
  );

  return (
    <>
      <div className="group relative overflow-hidden rounded-[2rem] p-[1px] transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent shadow-2xl">
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative h-full bg-card/60 backdrop-blur-3xl rounded-[1.9rem] p-6 md:p-8 flex flex-col gap-6 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 shadow-xl ring-1 ring-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Daily <span className="text-primary">Quiz</span></h3>
              </div>
            </div>
            {isCompleted && (
              <div className="p-2.5 bg-green-500/10 rounded-full border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground/90">{dailyQuiz.subject}</h3>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                dailyQuiz.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                dailyQuiz.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                'bg-red-500/10 text-red-500 border-red-500/20'
              }`}>
                {dailyQuiz.difficulty}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Questions', val: dailyQuiz.questions.length, icon: Award, color: 'text-primary' },
                { label: 'Max Reward', val: `${maxCoins} 🪙`, icon: Coins, color: 'text-accent' },
                { label: 'Est. Time', val: '~2 min', icon: Clock, color: 'text-muted-foreground' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1.5 group/item hover:bg-white/10 transition-all duration-500">
                  <item.icon className={`h-3.5 w-3.5 ${item.color} mb-0.5`} />
                  <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{item.label}</p>
                  <p className="text-xs font-black text-foreground tracking-tight">{item.val}</p>
                </div>
              ))}
            </div>

            {isCompleted ? (
              <div className="relative overflow-hidden p-5 rounded-[1.5rem] bg-green-500/5 border border-green-500/10 group/status shadow-inner">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-green-500/60">Mastery Achieved</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <Coins className="h-3 w-3 text-green-500" />
                    <span className="text-[10px] font-black text-green-500">+{coinsEarned}</span>
                  </div>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    style={{ width: `${(userProgress?.score || 0) / (userProgress?.totalQuestions || 1) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-3">
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500/40">
                    Efficiency: {Math.round((userProgress?.score || 0) / (userProgress?.totalQuestions || 1) * 100)}%
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-green-500/60">
                    {userProgress?.score}/{userProgress?.totalQuestions} Correct
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={handlePlayQuiz}
                className="group/btn relative w-full h-12 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-primary/40 border-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Initialize Challenge</span>
                  <ChevronRight className="h-3.5 w-3.5 text-white group-hover:translate-x-1.5 transition-transform duration-500" />
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background effects */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
        <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
      </div>

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-2xl w-[95vw] md:w-full bg-card/60 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-0 overflow-y-auto max-h-[90vh] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)]">
          <div className="p-8 md:p-10">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 shadow-xl ring-1 ring-primary/20">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black font-headline tracking-tight">Daily Quiz</DialogTitle>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{dailyQuiz.subject}</p>
                </div>
              </div>
            </DialogHeader>

            {isFinished ? (
              <div className="py-6 text-center space-y-8">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary/30 blur-[80px] rounded-full animate-pulse" />
                  <div className="relative space-y-3">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-1">Analysis Complete</span>
                      <h2 className="text-5xl font-black font-headline tracking-tighter text-foreground flex items-baseline gap-2">
                        {score}<span className="text-2xl text-muted-foreground/40">/</span><span className="text-2xl text-muted-foreground/40">{dailyQuiz.questions.length}</span>
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 group hover:bg-white/10 transition-all duration-500">
                    <div className="flex items-center gap-2 justify-center">
                      <Coins className="h-3.5 w-3.5 text-primary" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Coins Earned</p>
                    </div>
                    <p className="text-2xl font-black text-primary">+{coinsEarned}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 group hover:bg-white/10 transition-all duration-500">
                    <div className="flex items-center gap-2 justify-center">
                      <Award className="h-3.5 w-3.5 text-accent" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Accuracy</p>
                    </div>
                    <p className="text-2xl font-black text-foreground">{Math.round((score / dailyQuiz.questions.length) * 100)}%</p>
                  </div>
                </div>

                <button
                  onClick={handleFinishQuiz}
                  disabled={submitting}
                  className="group/btn relative w-full h-12 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-primary/40 disabled:opacity-50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center justify-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">
                      {submitting ? 'Transacting Rewards...' : 'Claim & Synchronize'}
                    </span>
                    {!submitting && <ChevronRight className="h-3.5 w-3.5 text-white group-hover:translate-x-1.5 transition-transform duration-500" />}
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Sequence Control</p>
                      <p className="text-xs font-black text-foreground">Question {currentQuestionIndex + 1} of {dailyQuiz.questions.length}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60">Progression</p>
                      <p className="text-xs font-black text-primary">{Math.round(((currentQuestionIndex + 1) / dailyQuiz.questions.length) * 100)}%</p>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                      style={{ width: `${((currentQuestionIndex + 1) / dailyQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-5">
                    <MessageSquare className="h-16 w-16 text-primary rotate-12" />
                  </div>
                  <p className="relative text-lg md:text-xl font-black text-foreground leading-tight tracking-tight">
                    {dailyQuiz.questions[currentQuestionIndex].question}
                  </p>
                </div>

                <div className="grid gap-3">
                  {dailyQuiz.questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`group/opt relative w-full p-4 md:p-5 text-left rounded-xl border transition-all duration-500 ${
                        selectedAnswer === index
                          ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.1)]'
                          : 'border-white/10 bg-white/5 hover:border-primary/30 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                          selectedAnswer === index
                            ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-[0_0_15px_rgba(var(--primary),0.4)]'
                            : 'border-white/10 bg-white/5 text-muted-foreground group-hover/opt:border-primary/30'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className={`text-sm md:text-base font-black tracking-tight transition-colors duration-500 ${selectedAnswer === index ? 'text-primary' : 'text-foreground/80 group-hover/opt:text-foreground'}`}>
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className="group/btn relative w-full h-12 overflow-hidden rounded-xl bg-white text-black transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] shadow-xl disabled:opacity-20 disabled:grayscale disabled:scale-100"
                >
                  <div className="relative flex items-center justify-center gap-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">
                      {currentQuestionIndex < dailyQuiz.questions.length - 1 ? 'Commit & Next' : 'Finalize Challenge'}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1.5" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
