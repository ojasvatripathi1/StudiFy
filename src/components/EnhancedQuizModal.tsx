"use client";

import { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, QuizCategory, Purchase } from '@/lib/types';
import { getQuizQuestions, submitQuizResult } from '@/lib/firebase';
import { getUserHintPack, consumeBooster, getActiveTimeExtension } from '@/lib/shopFirebase';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BinaryIcon, Database, Cpu, Network, Clock, Award, Lightbulb, Loader2, AlertTriangle, Calculator, Brain, Book, Code, Atom, FlaskConical, Dna, Scroll, Globe, Feather } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const categoryIcons = {
  ds_algo: BinaryIcon,
  database: Database,
  os: Cpu,
  networks: Network,
  math: Calculator,
  aptitude: Brain,
  grammar: Book,
  programming: Code,
  physics: Atom,
  chemistry: FlaskConical,
  biology: Dna,
  history: Scroll,
  geography: Globe,
  literature: Feather,
  general_knowledge: Lightbulb
};

const categoryColors = {
  ds_algo: 'bg-blue-500',
  database: 'bg-purple-500',
  os: 'bg-green-500',
  networks: 'bg-orange-500',
  math: 'bg-yellow-500',
  aptitude: 'bg-pink-500',
  grammar: 'bg-teal-500',
  programming: 'bg-slate-500',
  physics: 'bg-violet-500',
  chemistry: 'bg-lime-500',
  biology: 'bg-emerald-500',
  history: 'bg-amber-600',
  geography: 'bg-sky-500',
  literature: 'bg-rose-400',
  general_knowledge: 'bg-yellow-400'
};

const getTimeLimit = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  // 15 questions * ~1-1.5 min per question = 15-20 mins
  // Let's give generous time for learning: 10 mins (600s) to 15 mins (900s)
  return difficulty === 'hard' ? 900 : 720;
};

interface EnhancedQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: QuizCategory;
  onQuizComplete: (category: QuizCategory, score: number, coinsEarned: number, totalQuestions?: number, correctAnswers?: number) => void;
}

export function EnhancedQuizModal({ isOpen, onClose, category, onQuizComplete }: EnhancedQuizModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [results, setResults] = useState<{ score: number; coinsEarned: number; correctAnswers: number } | null>(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Hint Logic State
  const [hintPack, setHintPack] = useState<Purchase | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [isApplyingHint, setIsApplyingHint] = useState(false);
  const [hintsUsedThisQuiz, setHintsUsedThisQuiz] = useState<Set<number>>(new Set());
  const [generatedHints, setGeneratedHints] = useState<Record<number, string>>({});

  const IconComponent = categoryIcons[category];

  const handleStartQuiz = async () => {
    // Reset timer based on first question's difficulty when starting the quiz
    if (questions.length > 0) {
      let timeLimit = getTimeLimit(questions[0].difficulty);
      
      // Check for active time extension booster
      if (user) {
        try {
          const timeExtension = await getActiveTimeExtension(user.uid);
          if (timeExtension) {
            timeLimit += timeExtension.extraSeconds;
            // Use one charge of the time extension
            await consumeBooster(user.uid, timeExtension.purchaseId);
          }
        } catch (error) {
          console.error('Error checking time extension:', error);
        }
      }
      
      setTimeLeft(timeLimit);
    }
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleUseHint = async () => {
    if (!user || !hintPack || isApplyingHint || showHint) return;

    // Check if hints are exhausted
    const remainingHints = (hintPack.maxUses || 0) - (hintPack.usedCount || 0);
    if (remainingHints <= 0) {
      toast({
        title: "No Hints Left",
        description: "You have used all hints in this pack. Purchase a new one in the shop!",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingHint(true);
    try {
      let hintToDisplay = "";

      // 1. Try to get AI hint if not already generated
      if (generatedHints[currentQuestion]) {
        hintToDisplay = generatedHints[currentQuestion];
      } else {
        const question = questions[currentQuestion];
        try {
          const res = await fetch("/api/ai/hint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: question.question,
              options: question.options ?? [],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            hintToDisplay = data.response ?? "";
            setGeneratedHints(prev => ({ ...prev, [currentQuestion]: hintToDisplay }));
          } else {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error ?? "Hint request failed");
          }
        } catch (apiError) {
          console.error("AI hint generation failed:", apiError);
          // Fallback to hardcoded hint if available
          hintToDisplay = question.hint || "Try elimination of clearly wrong choices.";
        }
      }

      // 2. Decrement booster count
      const success = await consumeBooster(user.uid, hintPack.id);
      if (success) {
        setShowHint(true);
        setHintsUsedThisQuiz(prev => new Set(prev).add(currentQuestion));
        // Update local hint pack count
        setHintPack(prev => {
          if (!prev) return null;
          return {
            ...prev,
            usedCount: (prev.usedCount || 0) + 1
          };
        });
        toast({
          title: "Hint Used",
          description: "One hint has been deducted from your pack.",
        });
      } else {
        toast({
          title: "Error",
          description: "Could not use hint. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error using hint:', error);
    } finally {
      setIsApplyingHint(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = useCallback(async () => {
    if (!questions.length || !user) return;

    setLoading(true);
    try {
      const result = await submitQuizResult(user.uid, category, questions, selectedAnswers);
      setResults(result);
      setQuizCompleted(true);
      onQuizComplete(category, result.score, result.coinsEarned, questions.length, result.correctAnswers);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  }, [questions, user, category, selectedAnswers, onQuizComplete]);

  const handleClose = () => {
    if (quizStarted && !quizCompleted) {
      setShowCancelWarning(true);
      return;
    }
    resetAndClose();
  };

  const resetAndClose = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    // Reset to default time (will be updated when questions load)
    setTimeLeft(60);
    setResults(null);
    setShowHint(false);
    setHintsUsedThisQuiz(new Set());
    setGeneratedHints({});
    setShowCancelWarning(false);
    setIsCancelling(false);
    onClose();
  };

  const handleConfirmCancel = async () => {
    if (!user) return;
    setIsCancelling(true);
    try {
      // Submit a failed quiz result with 0 score to block today's attempt
      // Using an empty selectedAnswers array or -1s to ensure 0 score
      const failedAnswers = new Array(questions.length).fill(-1);
      await submitQuizResult(user.uid, category, questions, failedAnswers);
      
      toast({
        title: "Quiz Cancelled",
        description: "You've used your attempt for today. No coins earned.",
        variant: "destructive",
      });
      
      resetAndClose();
    } catch (error) {
      console.error('Error cancelling quiz:', error);
      // Still close even if Firestore update fails, to avoid trapping the user
      resetAndClose();
    }
  };

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const questionsData = await getQuizQuestions(category);
      setQuestions(questionsData);
      setSelectedAnswers(new Array(questionsData.length).fill(-1));
      setCurrentQuestion(0);
    
      // Set time based on question difficulty (use first question's difficulty as reference)
      let timeLimit = questionsData.length > 0
        ? getTimeLimit(questionsData[0].difficulty)
        : 60; // Default to 1 minute if no questions
      
      setTimeLeft(timeLimit);

      setQuizCompleted(false);
      setResults(null);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    if (isOpen && !quizStarted) {
      loadQuestions();
    }
  }, [isOpen, category, quizStarted, loadQuestions]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && quizStarted && !quizCompleted) {
      handleSubmitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, quizStarted, quizCompleted, handleSubmitQuiz]);

  // Fetch hint pack status
  useEffect(() => {
    const fetchHintPack = async () => {
      if (user && quizStarted && !quizCompleted) {
        const pack = await getUserHintPack(user.uid);
        setHintPack(pack);
      }
    };
    fetchHintPack();
  }, [user, quizStarted, quizCompleted]);

  // Reset hint display when moving to next/prev question
  useEffect(() => {
    setShowHint(false);
  }, [currentQuestion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;
  const answeredQuestions = selectedAnswers.filter(answer => answer !== -1).length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8">
        <DialogHeader className="mb-4 md:mb-5">
          <DialogTitle className="flex items-center gap-2 text-lg md:text-xl font-black uppercase tracking-tight">
            <IconComponent className="h-5 w-5 text-primary" />
            {category.charAt(0).toUpperCase() + category.slice(1)} Quiz
          </DialogTitle>
          <DialogDescription className="font-bold uppercase tracking-widest text-[9px] md:text-[10px]">
            Test your knowledge and earn coins!
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}

        {!quizStarted && !loading && questions.length > 0 && (
          <div className="space-y-5 py-2">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${categoryColors[category]} flex items-center justify-center mb-3`}>
                <IconComponent className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-1.5">{category.charAt(0).toUpperCase() + category.slice(1)} Quiz</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Answer {questions.length} questions to earn up to {questions.length * 5} coins!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="text-center p-3 border rounded-xl">
                <Clock className="h-5 w-5 mx-auto mb-1.5 text-blue-500" />
                <div className="text-sm font-semibold">
                  {questions[0]?.difficulty === 'hard' ? '15 Mins' : '12 Mins'}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {questions[0]?.difficulty === 'hard' ? 'Hard mode' : 'Regular mode'}
                </div>
              </div>
              <div className="text-center p-3 border rounded-xl">
                <Award className="h-5 w-5 mx-auto mb-1.5 text-yellow-500" />
                <div className="text-sm font-semibold">5 Coins</div>
                <div className="text-[10px] text-muted-foreground">Per Answer</div>
              </div>
            </div>

            <Button onClick={handleStartQuiz} className="w-full h-11 rounded-xl font-bold uppercase tracking-wider text-xs" size="lg">
              Start Quiz
            </Button>
          </div>
        )}

        {quizStarted && !quizCompleted && questions.length > 0 && (
          <div className="space-y-5 py-2">
            {/* Quiz Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[10px] h-6 px-2">
                  Q {currentQuestion + 1} / {questions.length}
                </Badge>
                <Badge variant="secondary" className="text-[10px] h-6 px-2">
                  {answeredQuestions}/{questions.length} Answered
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span className={`font-mono text-sm ${timeLeft < 60 ? 'text-red-500' : ''}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <Progress value={progress} className="h-1.5 w-full" />

            {/* Current Question */}
            <Card className="rounded-xl border-white/10">
              <CardContent className="p-5 md:p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-base md:text-lg font-semibold flex-1 leading-tight">
                    {questions[currentQuestion]?.question}
                  </h3>
                  {hintPack && (
                    <div className="ml-3 flex-shrink-0">
                      <Button
                        size="sm"
                        variant={showHint || hintsUsedThisQuiz.has(currentQuestion) ? "ghost" : "outline"}
                        className={`gap-1.5 h-8 text-[10px] ${showHint || hintsUsedThisQuiz.has(currentQuestion) ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 border-yellow-200' : ''} ${isApplyingHint ? 'opacity-90' : ''}`}
                        onClick={handleUseHint}
                        disabled={isApplyingHint || showHint || hintsUsedThisQuiz.has(currentQuestion) || ((hintPack.maxUses || 0) - (hintPack.usedCount || 0) <= 0)}
                      >
                        {isApplyingHint ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <Lightbulb className={`h-3 w-3 ${showHint || hintsUsedThisQuiz.has(currentQuestion) ? 'fill-yellow-500' : ''}`} />
                            {showHint || hintsUsedThisQuiz.has(currentQuestion) ? 'Hint Active' : `Hint (${Math.max(0, (hintPack.maxUses || 0) - (hintPack.usedCount || 0))})`}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {isApplyingHint && !generatedHints[currentQuestion] && (
                  <div className="mb-4 p-3 bg-yellow-50/70 border border-yellow-200 border-dashed rounded-lg flex items-center gap-2 text-yellow-800">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    <p className="text-[11px] font-medium">Generating your hint...</p>
                  </div>
                )}

                {(showHint || hintsUsedThisQuiz.has(currentQuestion)) && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex gap-2 items-start text-yellow-800">
                      <Lightbulb className="h-4 w-4 fill-yellow-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[11px]">Hint:</p>
                        <p className="text-[11px] italic leading-relaxed">
                          {generatedHints[currentQuestion] || questions[currentQuestion]?.hint || "Try elimination of clearly wrong choices."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2.5">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <Button
                      key={index}
                      variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                      className={`w-full text-left justify-start h-auto p-3.5 text-sm md:text-base rounded-lg transition-all ${
                        selectedAnswers[currentQuestion] === index ? 'shadow-lg shadow-primary/20 scale-[1.01]' : ''
                      }`}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <span className="mr-2.5 font-bold text-xs opacity-60">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                className="flex-1 h-10 rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Previous
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestion] === -1}
                className="flex-[1.5] h-10 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </div>
          </div>
        )}

        {quizCompleted && results && (
          <div className="space-y-5 py-2">
            {/* Summary Section */}
            <div className="text-center space-y-3">
              <div className={`w-16 h-16 mx-auto rounded-full ${categoryColors[category]} flex items-center justify-center mb-3`}>
                <Award className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold mb-1">Quiz Complete! 🎉</h3>
                <p className="text-sm text-muted-foreground">Great job on completing the {category} quiz!</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
                <div className="text-center p-3 md:p-4 border border-blue-100 rounded-xl bg-blue-50/50">
                  <div className="text-xl md:text-2xl font-black text-blue-600 tracking-tighter">{Number(results.score).toFixed(2)}%</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-blue-400">Score</div>
                </div>
                <div className="text-center p-3 md:p-4 border border-emerald-100 rounded-xl bg-emerald-50/50">
                  <div className="text-xl md:text-2xl font-black text-emerald-600 tracking-tighter">{results.correctAnswers}/{questions.length}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Correct</div>
                </div>
                <div className="text-center p-3 md:p-4 border border-amber-100 rounded-xl bg-amber-50/50">
                  <div className="text-xl md:text-2xl font-black text-amber-600 tracking-tighter">{results.coinsEarned}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-amber-400">Coins Earned</div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Review Section */}
            <div className="space-y-3">
              <h4 className="text-base font-bold uppercase tracking-wider text-muted-foreground/60">Answer Review</h4>

              {questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                const userAnswerText = userAnswer !== -1 ? question.options[userAnswer] : 'Not answered';
                const correctAnswerText = question.options[question.correctAnswer];

                return (
                  <div key={index} className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-tight">{index + 1}. {question.question}</p>
                      <Badge variant={isCorrect ? "secondary" : "destructive"} className="shrink-0 text-[10px] h-5 px-1.5">
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-black/20">
                        <span className="text-muted-foreground block mb-0.5">Your Answer:</span>
                        <span className={isCorrect ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>
                          {userAnswerText}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <span className="text-emerald-400/60 block mb-0.5">Correct Answer:</span>
                          <span className="text-emerald-400 font-medium">{correctAnswerText}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={handleClose} className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs" size="lg">
              Return to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>

      <AlertDialog open={showCancelWarning} onOpenChange={setShowCancelWarning}>
        <AlertDialogContent className="rounded-3xl border-white/10 bg-card/95 backdrop-blur-2xl p-8">
          <AlertDialogHeader className="space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight text-center">
              Abandon Quiz?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 text-center leading-relaxed">
              If you cancel now, you will <span className="text-red-500">lose your daily attempt</span> for this category and earn <span className="text-red-500">zero coins</span>. 
              <br /><br />
              This action cannot be undone. Are you sure you want to quit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
            <AlertDialogCancel className="flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] border-white/5 hover:bg-white/5 transition-all">
              Continue Quiz
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleConfirmCancel();
              }}
              disabled={isCancelling}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-red-500 hover:bg-red-600 text-white shadow-2xl shadow-red-500/20 transition-all"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Yes, Abandon"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
