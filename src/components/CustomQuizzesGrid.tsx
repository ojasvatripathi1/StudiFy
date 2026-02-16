'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Play, Clock, Trophy, Target, CheckCircle2 } from 'lucide-react';
import { CustomQuiz, getUserCustomQuizzes, deleteCustomQuiz } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function CustomQuizzesGrid() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<CustomQuiz | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Quiz taking states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const loadCustomQuizzes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const customQuizzes = await getUserCustomQuizzes(user.uid);
      setQuizzes(customQuizzes);
    } catch (error) {
      console.error('Error loading custom quizzes:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCustomQuizzes();
  }, [loadCustomQuizzes]);

  const handleDeleteQuiz = async () => {
    if (!user || !quizToDelete) return;
    try {
      await deleteCustomQuiz(user.uid, quizToDelete);
      setQuizzes(quizzes.filter(q => q.id !== quizToDelete));
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handlePlayQuiz = (quiz: CustomQuiz) => {
    setSelectedQuiz(quiz);
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
    if (selectedQuiz && selectedAnswer !== null) {
      const currentQuestion = selectedQuiz.questions[currentQuestionIndex];
      if (selectedAnswer === currentQuestion.correctAnswer) {
        setScore(prev => prev + 1);
      }

      setSelectedAnswer(null);

      if (currentQuestionIndex < selectedQuiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setIsFinished(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-60 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Loading Quizzes...</p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="group relative overflow-hidden rounded-[2.5rem] p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
        <div className="relative bg-card/80 backdrop-blur-xl rounded-[2.4rem] p-12 text-center flex flex-col items-center gap-6 shadow-xl">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <FileText className="h-10 w-10 text-primary opacity-50" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-foreground">No custom quizzes yet</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-md">
              Upload a PDF or document in Study AI and create quizzes from it to start learning!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = selectedQuiz && !isFinished ? selectedQuiz.questions[currentQuestionIndex] : null;
  const progress = selectedQuiz ? ((currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100 : 0;

  return (
    <>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="group relative overflow-hidden rounded-[2rem] p-0.5 transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative h-full bg-card/40 backdrop-blur-3xl rounded-[1.9rem] p-6 md:p-8 flex flex-col gap-6 shadow-2xl border border-white/5">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-lg">
                    CUSTOM CHALLENGE
                  </div>
                  <button
                    onClick={() => {
                      setQuizToDelete(quiz.id || '');
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2.5 rounded-xl text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/10 transition-all duration-500 group/delete"
                  >
                    <Trash2 className="h-4 w-4 group-hover/delete:scale-110" />
                  </button>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-500">
                  {quiz.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                    {quiz.topic}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-[1.5rem] border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">TASKS</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{quiz.questions.length} Questions</span>
                </div>
                <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-[1.5rem] border border-white/5 group-hover:bg-accent/5 group-hover:border-accent/20 transition-all duration-500">
                  <Clock className="h-3.5 w-3.5 text-accent" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">EST. TIME</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{Math.ceil(quiz.questions.length * 0.5)} Min</span>
                </div>
              </div>

              {/* Description */}
              {quiz.description && (
                <p className="text-xs text-muted-foreground/80 font-bold uppercase tracking-wider leading-relaxed line-clamp-2 flex-1">
                  {quiz.description}
                </p>
              )}

              {/* Play Button */}
              <Button
                onClick={() => handlePlayQuiz(quiz)}
                className="w-full h-12 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] bg-gradient-to-r from-primary to-primary/80 hover:shadow-2xl hover:shadow-primary/40 text-white border-0 transition-all duration-700 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <Play className="h-3.5 w-3.5 fill-current" />
                  LAUNCH SESSION
                </div>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-2xl w-[95vw] md:w-full bg-card/60 backdrop-blur-3xl border-0 rounded-[1.5rem] md:rounded-[2rem] p-0 overflow-y-auto max-h-[90vh] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
          <div className="relative p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50" />
            <div className="relative bg-card/90 rounded-[1.4rem] overflow-hidden">
              <div className="p-8 md:p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <DialogHeader className="space-y-3 text-left">
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
                      {selectedQuiz?.title}
                    </DialogTitle>
                    {!isFinished && (
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          QUESTION {currentQuestionIndex + 1} OF {selectedQuiz?.questions.length}
                        </div>
                        <div className="h-1.5 w-24 bg-primary/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-700" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </DialogHeader>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 shadow-xl">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {isFinished ? (
                  <div className="space-y-8">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-gradient-to-br from-primary via-primary to-accent p-0.5 shadow-2xl rotate-3">
                        <div className="w-full h-full bg-card rounded-[1.4rem] flex items-center justify-center">
                          <Trophy className="h-10 w-10 text-primary" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                          {score}/{selectedQuiz?.questions.length}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                          SESSION COMPLETED
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-primary/5 rounded-[1.5rem] p-6 border border-primary/10 text-center space-y-2">
                        <div className="flex justify-center">
                          <div className="p-2.5 rounded-lg bg-primary/10">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-foreground">{score}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CORRECT</div>
                      </div>
                      <div className="bg-accent/5 rounded-[1.5rem] p-6 border border-accent/10 text-center space-y-2">
                        <div className="flex justify-center">
                          <div className="p-2.5 rounded-lg bg-accent/10">
                            <Target className="h-5 w-5 text-accent" />
                          </div>
                        </div>
                        <div className="text-2xl font-black text-foreground">{selectedQuiz ? selectedQuiz.questions.length - score : 0}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">INCORRECT</div>
                      </div>
                    </div>

                    <Button
                      onClick={() => setShowQuizModal(false)}
                      className="w-full h-12 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] bg-primary text-white hover:shadow-2xl hover:shadow-primary/40 transition-all duration-700 hover:scale-[1.02]"
                    >
                      RETURN TO DASHBOARD
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="p-6 md:p-8 rounded-[1.5rem] bg-white/5 border border-white/5 shadow-2xl">
                      <h4 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight">
                        {currentQuestion?.question}
                      </h4>
                    </div>

                    <div className="grid gap-3">
                      {currentQuestion?.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          className={`w-full p-5 md:p-6 rounded-[1.2rem] text-left transition-all duration-500 border ${
                            selectedAnswer === index
                              ? 'bg-primary/20 border-primary shadow-2xl shadow-primary/20 scale-[1.02]'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                              selectedAnswer === index ? 'bg-primary text-white' : 'bg-white/10 text-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className={`text-sm md:text-base font-bold uppercase tracking-wide ${
                              selectedAnswer === index ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {option}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={handleNextQuestion}
                      disabled={selectedAnswer === null}
                      className="w-full h-12 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] bg-primary text-white hover:shadow-2xl hover:shadow-primary/40 transition-all duration-700 disabled:opacity-20 disabled:grayscale"
                    >
                      {currentQuestionIndex === (selectedQuiz?.questions.length || 0) - 1 ? 'FINISH SESSION' : 'NEXT QUESTION'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md w-[95vw] md:w-full bg-card/60 backdrop-blur-3xl border-0 rounded-[1.5rem] md:rounded-[2rem] p-0 overflow-y-auto max-h-[90vh] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
          <div className="relative p-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-transparent opacity-50" />
            <div className="relative bg-card/90 rounded-[1.4rem] p-8 md:p-10 space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-red-500/10 flex items-center justify-center shadow-2xl shadow-red-500/10 border border-red-500/20">
                  <Trash2 className="h-8 w-8 text-red-500" />
                </div>
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">Delete Challenge?</DialogTitle>
                  <DialogDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-relaxed">
                    This action is permanent and cannot be undone. Are you sure?
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-12 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handleDeleteQuiz}
                  className="h-12 rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] bg-red-500 text-white hover:bg-red-600 hover:shadow-2xl hover:shadow-red-500/40 border-0 transition-all duration-500"
                >
                  CONFIRM DELETE
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
