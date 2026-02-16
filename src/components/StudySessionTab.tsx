'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { 
  createStudySession, 
  completeStudySession, 
  getUserStudySessions,
  recordSessionBreak
} from '@/lib/studySessionFirebase';
import { StudySession, SubjectType } from '@/lib/studySessionTypes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Clock, 
  BookOpen, 
  Target,
  RotateCw,
  Plus,
  Coffee,
  Timer,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Trophy
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const SUBJECTS: { value: SubjectType; label: string }[] = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'programming', label: 'Programming' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'aptitude', label: 'Aptitude' },
  { value: 'general', label: 'General' },
  { value: 'custom', label: 'Custom' },
];

interface ActiveSession {
  session: StudySession;
  elapsedTime: number;
  isRunning: boolean;
}

export default function StudySessionTab({ onSessionActiveChange }: { onSessionActiveChange?: (isActive: boolean) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);

  useEffect(() => {
    onSessionActiveChange?.(!!activeSession);
  }, [activeSession, onSessionActiveChange]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  
  // Break timer states
  const [isBreakActive, setIsBreakActive] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);

  // Form states for creating new session
  const [newSessionData, setNewSessionData] = useState({
    subject: 'general' as SubjectType,
    title: '',
    description: '',
    plannedDuration: 30, // in minutes
  });

  // Form states for completing session
  const [sessionNotes, setSessionNotes] = useState('');
  const [focusLevel, setFocusLevel] = useState(5);
  const [productivity, setProductivity] = useState(5);
  const [distractions, setDistractions] = useState('');
  const [topics, setTopics] = useState('');
  const [achievements, setAchievements] = useState('');

  const loadSessions = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const userSessions = await getUserStudySessions(user.uid, undefined, 20);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user, loadSessions]);
  useEffect(() => {
    if (!activeSession?.isRunning || isBreakActive) return;

    const interval = setInterval(() => {
      setActiveSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.isRunning, isBreakActive]);

  // Break timer effect
  useEffect(() => {
    if (!isBreakActive || breakTimeRemaining <= 0) {
      if (isBreakActive && breakTimeRemaining <= 0) {
        setIsBreakActive(false);
      }
      return;
    }

    const interval = setInterval(() => {
      setBreakTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreakActive, breakTimeRemaining]);

  // Prevent navigation when session is active
  useEffect(() => {
    if (!activeSession) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeSession]);

  const handleCreateSession = async () => {
    if (!user?.uid || !newSessionData.title) return;

    if (newSessionData.plannedDuration < 5) {
      toast({
        title: "Duration Too Short",
        description: "You must study for at least 5 minutes to earn XP and maintain your streak.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const session = await createStudySession(
        user.uid,
        newSessionData.subject,
        newSessionData.title,
        newSessionData.description,
        newSessionData.plannedDuration * 60
      );

      setActiveSession({
          session,
          elapsedTime: 0,
          isRunning: true,
        });
        setShowFocusWarning(true);

        setNewSessionData({
        subject: 'general',
        title: '',
        description: '',
        plannedDuration: 30,
      });
      setIsCreatingSession(false);

      await loadSessions();
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePauseSession = () => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isRunning: false,
      };
    });
  };

  const handleResumeSession = () => {
    if (!activeSession) return;
    setActiveSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        isRunning: true,
      };
    });
  };

  const handleTakeBreak = async () => {
    if (!activeSession || !user?.uid) return;

    try {
      const breakDuration = 5 * 60; // 5 minutes in seconds
      setIsBreakActive(true);
      setBreakTimeRemaining(breakDuration);
      await recordSessionBreak(user.uid, activeSession.session.id, breakDuration);
    } catch (error) {
      console.error('Error recording break:', error);
    }
  };

  const handleCompleteSession = async () => {
    if (!activeSession || !user?.uid) return;

    try {
      setLoading(true);
      await completeStudySession(
        user.uid,
        activeSession.session.id,
        Timestamp.now(),
        sessionNotes,
        focusLevel,
        productivity,
        distractions.split(',').map((d) => d.trim()).filter(Boolean),
        topics.split(',').map((t) => t.trim()).filter(Boolean),
        achievements.split(',').map((a) => a.trim()).filter(Boolean)
      );

      setActiveSession(null);
      setIsBreakActive(false);
      setBreakTimeRemaining(0);
      setSessionNotes('');
      setFocusLevel(5);
      setProductivity(5);
      setDistractions('');
      setTopics('');
      setAchievements('');
      setCompletingSessionId(null);

      await loadSessions();
    } catch (error) {
      console.error('Error completing session:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes < 10 ? '0' : ''}${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatBreakTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="space-y-6 relative">
      {/* Strict Focus Mode Overlay */}
      {activeSession && showFocusWarning && (
        <div className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8 pointer-events-auto">
          <div className="max-w-lg w-full group relative overflow-hidden rounded-[2rem] sm:rounded-[3rem] p-1 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent shadow-2xl">
            <div className="relative bg-card/95 backdrop-blur-2xl rounded-[1.9rem] sm:rounded-[2.9rem] p-8 sm:p-12 flex flex-col items-center gap-6 sm:gap-8 text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[1.2rem] sm:rounded-[2rem] bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              
              <div className="space-y-2 sm:space-y-4">
                <h2 className="text-xl sm:text-3xl font-black uppercase tracking-[0.2em] text-foreground">
                  Focus Mode
                </h2>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
                  You are now entering deep work mode. Finish your session to unlock the rest of the application.
                </p>
              </div>

              <div className="w-full bg-amber-500/10 border border-amber-500/20 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] flex gap-3 sm:gap-4 items-start text-left">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] sm:text-xs text-amber-600 leading-relaxed font-black uppercase tracking-[0.2em]">
                  Concentration is key. Switching tabs or navigating away will break your streak.
                </p>
              </div>

              <Button 
                onClick={() => {
                  setShowFocusWarning(false);
                  const element = document.getElementById('active-session-card');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full h-12 sm:h-16 rounded-[1rem] sm:rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500 text-xs sm:text-sm"
              >
                Start Focusing
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* For desktop, we can use a more subtle but still strict approach if needed, 
          but usually the goal is to keep the session visible and prevent easy navigation.
          Since this is a tab-based UI, we'll apply a global overlay when activeSession exists. */}
      {activeSession && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Hide other tabs or disable navigation if session is active */
          [role="tablist"] button:not([data-state="active"]) {
            pointer-events: none !important;
            opacity: 0.5 !important;
            cursor: not-allowed !important;
          }
          /* Disable sidebar/header links if they exist */
          nav a, aside a, header a {
            pointer-events: none !important;
            opacity: 0.7 !important;
          }
        `}} />
      )}

      {/* Active Session Display */}
      {activeSession && (
        <div 
          id="active-session-card" 
          className={cn(
            "group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-0.5 md:p-1 transition-all duration-700 max-w-5xl mx-auto",
            activeSession.isRunning 
              ? "bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient shadow-2xl shadow-primary/20" 
              : "bg-gradient-to-br from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_auto] animate-gradient shadow-2xl shadow-amber-500/20"
          )}
        >
          <div className="relative bg-card/90 backdrop-blur-2xl rounded-[1.4rem] md:rounded-[1.9rem] p-4 md:p-8 lg:p-10 flex flex-col gap-6 md:gap-8 lg:gap-10 shadow-xl border border-white/10 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className={cn(
              "absolute -top-12 -right-12 w-32 h-32 md:w-64 md:h-64 rounded-full blur-[40px] md:blur-[80px] opacity-20 animate-pulse",
              activeSession.isRunning ? "bg-primary" : "bg-amber-500"
            )} />
            
            {/* Header Section */}
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-5 lg:gap-6">
                <div className={cn(
                  "p-3 md:p-4 rounded-[0.8rem] md:rounded-[1.2rem] shadow-2xl ring-2 ring-white/20 transition-transform group-hover:scale-110 duration-700",
                  activeSession.isRunning 
                    ? "bg-gradient-to-br from-primary to-accent text-white" 
                    : "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                )}>
                  <BookOpen className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8" />
                </div>
                <div className="space-y-0.5 md:space-y-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className={cn(
                      "text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border shadow-sm",
                      activeSession.isRunning 
                        ? "bg-primary/10 text-primary border-primary/20" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {activeSession.session.subject}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-tight text-foreground leading-none">
                    Deep Focus Mode
                  </h3>
                </div>
              </div>

              <div className={cn(
                "px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] animate-pulse border shadow-xl",
                isBreakActive 
                  ? "bg-orange-500 text-white border-white/20 shadow-orange-500/40" 
                  : activeSession.isRunning 
                    ? "bg-primary text-white border-white/20 shadow-primary/40" 
                    : "bg-amber-500 text-white border-white/20 shadow-amber-500/40"
              )}>
                {isBreakActive ? "Time for a Break" : activeSession.isRunning ? "Live Recording" : "Focus Paused"}
              </div>
            </div>

            {/* Timer Visualization */}
            <div className="relative flex flex-col items-center gap-6 md:gap-8">
              <div className="relative flex items-center justify-center w-full max-w-[200px] md:max-w-[240px] lg:max-w-[300px] aspect-square">
                {/* Advanced Progress Ring */}
                <svg className="absolute w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 400 400">
                  <circle
                    cx="200"
                    cy="200"
                    r="180"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-secondary/30"
                  />
                  <circle
                    cx="200"
                    cy="200"
                    r="180"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 180}
                    strokeDashoffset={2 * Math.PI * 180 * (1 - (isBreakActive ? (breakTimeRemaining / 300) : Math.min(activeSession.elapsedTime / (activeSession.session.plannedDuration || 1), 1)))}
                    strokeLinecap="round"
                    className={cn(
                      "transition-all duration-1000",
                      isBreakActive ? "text-orange-500" : activeSession.isRunning ? "text-primary" : "text-amber-500"
                    )}
                  />
                </svg>

                <div className="relative text-center z-10 space-y-1 md:space-y-2">
                  <div className={cn(
                    "text-4xl md:text-5xl lg:text-6xl font-black font-mono tracking-tighter transition-all duration-700",
                    isBreakActive ? "text-orange-600 scale-105" : activeSession.isRunning ? "text-foreground" : "text-amber-600"
                  )}>
                    {isBreakActive ? formatBreakTime(breakTimeRemaining) : formatTime(activeSession.elapsedTime)}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-0.5 w-6 md:w-8 rounded-full bg-primary/20" />
                    <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      {isBreakActive ? "Break Progress" : "Elapsed Duration"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Context */}
              <div className="w-full max-w-xl space-y-4 md:space-y-6">
                <div className="text-center space-y-1 md:space-y-2">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors duration-500">
                    {activeSession.session.title}
                  </h3>
                  {activeSession.session.description && (
                    <p className="text-[10px] md:text-xs lg:text-sm text-muted-foreground/80 font-medium italic leading-relaxed max-w-lg mx-auto px-4">
                      &quot;{activeSession.session.description}&quot;
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-secondary/30 backdrop-blur-xl p-4 md:p-5 lg:p-6 rounded-[1rem] md:rounded-[1.5rem] border border-white/5 space-y-2 md:space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">Progress Rate</p>
                        <h4 className="text-lg md:text-xl lg:text-2xl font-black text-foreground">
                          {isBreakActive ? Math.round((1 - breakTimeRemaining / 300) * 100) : Math.round(Math.min((activeSession.elapsedTime / (activeSession.session.plannedDuration || 1)) * 100, 100))}%
                        </h4>
                      </div>
                      <div className="p-1.5 md:p-2 rounded-lg bg-primary/10 text-primary">
                        <Target className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </div>
                    </div>
                    <div className="h-2 md:h-2.5 lg:h-3 w-full bg-black/5 rounded-full overflow-hidden p-0.5">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 bg-gradient-to-r shadow-[0_0_15px_rgba(var(--primary),0.3)]",
                          isBreakActive ? "from-orange-500 to-orange-400" : "from-primary to-accent"
                        )}
                        style={{ width: `${isBreakActive ? (1 - breakTimeRemaining / 300) * 100 : Math.min((activeSession.elapsedTime / (activeSession.session.plannedDuration || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-secondary/30 backdrop-blur-xl p-6 md:p-7 lg:p-8 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[8px] md:text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Planned Goal</p>
                      <h4 className="text-xl md:text-2xl font-black text-foreground">
                        {((activeSession.session.plannedDuration || 0) / 60)} <span className="text-[10px] md:text-xs font-black text-muted-foreground">MIN</span>
                      </h4>
                    </div>
                    <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-accent/10 text-accent">
                      <Clock className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {/* Control Center */}
          <div className="relative flex flex-wrap items-center justify-center gap-4 md:gap-5 lg:gap-6 pt-6 md:pt-8 lg:pt-10 border-t border-white/5">
            {activeSession.isRunning && !isBreakActive ? (
              <Button
                onClick={handlePauseSession}
                className="h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-10 rounded-[1rem] md:rounded-[1.1rem] lg:rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-2 border-amber-500/20 hover:border-amber-500/40 transition-all duration-500 shadow-xl"
              >
                <Pause className="h-4 w-4 md:h-4.5 lg:h-5 md:w-4.5 lg:w-5 mr-2 md:mr-2.5 lg:mr-3 fill-current" />
                Pause Session
              </Button>
            ) : !isBreakActive ? (
              <Button
                onClick={handleResumeSession}
                className="h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-10 rounded-[1rem] md:rounded-[1.1rem] lg:rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] bg-primary text-white hover:shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all duration-700"
              >
                <Play className="h-4 w-4 md:h-4.5 lg:h-5 md:w-4.5 lg:w-5 mr-2 md:mr-2.5 lg:mr-3 fill-current" />
                Resume Focus
              </Button>
            ) : null}

            {!isBreakActive && (
              <Button
                onClick={handleTakeBreak}
                disabled={!activeSession.isRunning}
                className="h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-10 rounded-[1rem] md:rounded-[1.1rem] lg:rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 border-2 border-orange-500/20 hover:border-orange-500/40 transition-all duration-500 disabled:opacity-50 shadow-xl"
              >
                <Coffee className="h-4 w-4 md:h-4.5 lg:h-5 md:w-4.5 lg:w-5 mr-2 md:mr-2.5 lg:mr-3" />
                Take 5m Break
              </Button>
            )}

            {isBreakActive && (
              <Button
                onClick={() => setIsBreakActive(false)}
                className="h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-10 rounded-[1rem] md:rounded-[1.1rem] lg:rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] bg-primary text-white hover:shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all duration-700"
              >
                <Play className="h-4 w-4 md:h-4.5 lg:h-5 md:w-4.5 lg:w-5 mr-2 md:mr-2.5 lg:mr-3 fill-current" />
                Return to Work
              </Button>
            )}

            <Dialog open={completingSessionId === activeSession.session.id} onOpenChange={(open) => {
              if (!open) setCompletingSessionId(null);
            }}>
              <DialogTrigger asChild>
                <Button
                  className="h-12 md:h-14 lg:h-16 px-6 md:px-8 lg:px-10 rounded-[1rem] md:rounded-[1.1rem] lg:rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all duration-700"
                  onClick={() => setCompletingSessionId(activeSession.session.id)}
                  disabled={isBreakActive}
                >
                  <CheckCircle2 className="h-4 w-4 md:h-4.5 lg:h-5 md:w-4.5 lg:w-5 mr-2 md:mr-2.5 lg:mr-3" />
                  Complete & Save
                </Button>
              </DialogTrigger>
                <DialogContent className="max-w-2xl w-[95vw] md:w-full bg-card/95 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-0 overflow-y-auto max-h-[90vh] shadow-2xl">
                  <div className="relative p-5 md:p-8 lg:p-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    
                    <div className="relative space-y-6 md:space-y-8 lg:space-y-10">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                        <div className="space-y-1.5 md:space-y-2 text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 text-primary">
                            <Zap className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em]">Deep Reflection</span>
                          </div>
                          <DialogTitle className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight text-foreground leading-none">
                            Victory! 🎉
                          </DialogTitle>
                          <div className="text-xs md:text-sm font-medium text-muted-foreground">
                            Every minute spent is a step toward mastery.
                          </div>
                        </div>
                        <div className="p-4 md:p-5 lg:p-6 rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                          <Trophy className="h-6 w-6 md:h-8 lg:h-10 md:w-8 lg:w-10 text-primary" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div className="md:col-span-2 group space-y-3">
                          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 flex items-center gap-2 md:gap-3">
                            <BookOpen className="h-3.5 w-3.5" />
                            Session Insights
                          </label>
                          <div className="relative">
                            <Textarea
                              placeholder="What are the key takeaways from this block?"
                              value={sessionNotes}
                              onChange={(e) => setSessionNotes(e.target.value)}
                              className="h-24 md:h-28 lg:h-32 resize-none rounded-[1.2rem] md:rounded-[1.4rem] lg:rounded-[1.5rem] bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:ring-0 text-xs md:text-sm font-medium p-4 md:p-5 lg:p-6 transition-all"
                            />
                            <div className="absolute bottom-3 right-4 text-[8px] md:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                              Reflection is Growth
                            </div>
                          </div>
                        </div>

                        <div className="md:col-span-2 group space-y-3">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 flex items-center gap-3">
                            <Target className="h-3.5 w-3.5" />
                            Key Concepts
                          </label>
                          <Input
                            placeholder="e.g., Quantum Mechanics, React Reconciliation..."
                            value={topics}
                            onChange={(e) => setTopics(e.target.value)}
                            className="h-12 md:h-14 lg:h-16 rounded-[1.2rem] md:rounded-[1.4rem] lg:rounded-[1.5rem] bg-secondary/30 border-2 border-transparent focus:border-primary/20 focus:ring-0 text-sm md:text-base font-bold px-5 lg:px-6 transition-all"
                          />
                        </div>

                        <div className="bg-primary/5 backdrop-blur-xl p-5 md:p-6 lg:p-8 rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2rem] border border-primary/10 space-y-4 md:space-y-6 lg:space-y-8 group transition-all hover:bg-primary/[0.08]">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary">Focus Level</label>
                              <p className="text-[10px] font-bold text-primary/60">How intense was your concentration?</p>
                            </div>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-black text-primary tracking-tighter">{focusLevel}<span className="text-xs opacity-40 ml-1">/10</span></span>
                          </div>
                          <Slider
                            value={[focusLevel]}
                            onValueChange={(v) => setFocusLevel(v[0])}
                            max={10}
                            min={1}
                            step={1}
                            className="py-1"
                          />
                        </div>

                        <div className="bg-accent/5 backdrop-blur-xl p-5 md:p-6 lg:p-8 rounded-[1.2rem] md:rounded-[1.5rem] lg:rounded-[2rem] border border-accent/10 space-y-4 md:space-y-6 lg:space-y-8 group transition-all hover:bg-accent/[0.08]">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-accent">Productivity</label>
                              <p className="text-[10px] font-bold text-accent/60">How much did you actually achieve?</p>
                            </div>
                            <span className="text-2xl md:text-3xl lg:text-4xl font-black text-accent tracking-tighter">{productivity}<span className="text-xs opacity-40 ml-1">/10</span></span>
                          </div>
                          <Slider
                            value={[productivity]}
                            onValueChange={(v) => setProductivity(v[0])}
                            max={10}
                            min={1}
                            step={1}
                            className="py-1"
                          />
                        </div>

                        <div className="md:col-span-1 group space-y-3">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 flex items-center gap-3">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            Friction Points
                          </label>
                          <Input
                            placeholder="e.g., Phone, Environment..."
                            value={distractions}
                            onChange={(e) => setDistractions(e.target.value)}
                            className="h-12 md:h-14 rounded-[1.2rem] bg-secondary/30 border-2 border-transparent focus:border-amber-500/20 focus:ring-0 text-xs md:text-sm font-bold px-4 lg:px-5 transition-all"
                          />
                        </div>

                        <div className="md:col-span-1 group space-y-3">
                          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2 flex items-center gap-3">
                            <Zap className="h-3.5 w-3.5 text-emerald-500" />
                            Breakthroughs
                          </label>
                          <Input
                            placeholder="What are you proud of?"
                            value={achievements}
                            onChange={(e) => setAchievements(e.target.value)}
                            className="h-12 md:h-14 rounded-[1.2rem] bg-secondary/30 border-2 border-transparent focus:border-emerald-500/20 focus:ring-0 text-xs md:text-sm font-bold px-4 lg:px-5 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 lg:gap-6">
                        <Button
                          variant="outline"
                          onClick={() => setCompletingSessionId(null)}
                          className="w-full sm:flex-1 h-12 md:h-14 lg:h-16 rounded-[1rem] md:rounded-[1.1rem] lg:rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs border-2 border-border/50 hover:bg-secondary/50 transition-all"
                        >
                          Discard
                        </Button>
                        <Button
                          onClick={handleCompleteSession}
                          disabled={loading}
                          className="w-full sm:flex-[2] h-12 md:h-14 lg:h-16 rounded-[1rem] md:rounded-[1.1rem] lg:rounded-[1.2rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all duration-700"
                        >
                          {loading ? (
                            <RotateCw className="h-4 w-4 md:h-5 md:w-5 animate-spin mr-2 md:mr-3 lg:mr-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 lg:mr-4" />
                          )}
                          {loading ? "Synchronizing..." : "Seal the Session"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      )}

      {/* Create New Session Button */}
      {!activeSession && (
        <Dialog open={isCreatingSession} onOpenChange={setIsCreatingSession}>
          <DialogTrigger asChild>
            <Button 
              className="w-full max-w-7xl mx-auto h-16 md:h-20 lg:h-24 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] hover:bg-right transition-all duration-700 shadow-2xl shadow-primary/20 group overflow-hidden relative flex"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-4 md:gap-6">
                <div className="p-2 md:p-3 lg:p-4 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                  <Plus className="h-5 w-5 md:h-6 lg:h-8 md:w-6 lg:w-8 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-black uppercase tracking-[0.1em] text-white">
                    Launch New Session
                  </h3>
                  <p className="text-[8px] md:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white/70">
                    Enter deep focus mode & earn XP
                  </p>
                </div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[95vw] md:w-full bg-card/95 backdrop-blur-2xl border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-0 overflow-y-auto max-h-[90vh] shadow-2xl">
            <div className="relative p-5 md:p-8 lg:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              
              <div className="relative space-y-6 md:space-y-8 lg:space-y-12">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 md:space-y-2">
                    <div className="flex items-center gap-2 md:gap-3 text-primary">
                      <Timer className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em]">Configure Session</span>
                    </div>
                    <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-[0.1em] text-foreground">
                      Ready to Focus?
                    </DialogTitle>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground">
                      Set your goals and subject to begin.
                    </p>
                  </div>
                  <div className="p-3 md:p-4 lg:p-5 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 shrink-0">
                    <Clock className="h-5 w-5 md:h-6 lg:h-8 md:w-6 lg:w-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Subject</label>
                      <Select
                        value={newSessionData.subject}
                        onValueChange={(value) =>
                          setNewSessionData((prev) => ({
                            ...prev,
                            subject: value as SubjectType,
                          }))
                        }
                      >
                        <SelectTrigger className="h-12 md:h-14 rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] bg-secondary/30 border-white/10 focus:ring-primary/20 font-bold text-xs md:text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] border-white/10 bg-card/95 backdrop-blur-xl">
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value} className="rounded-lg md:rounded-xl font-bold uppercase text-[8px] md:text-[10px] tracking-[0.2em]">
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Duration (min)</label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="5"
                          value={newSessionData.plannedDuration}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNewSessionData(prev => ({ ...prev, plannedDuration: isNaN(val) ? 0 : val }));
                          }}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value);
                            if (isNaN(val) || val < 5) {
                              setNewSessionData(prev => ({ ...prev, plannedDuration: 5 }));
                              toast({
                                title: "Minimum Duration",
                                description: "Study sessions must be at least 5 minutes long.",
                              });
                            }
                          }}
                          className={cn(
                            "h-12 md:h-14 rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] bg-secondary/30 border-white/10 focus:ring-primary/20 font-black text-base md:text-lg pr-10 md:pr-12",
                            newSessionData.plannedDuration < 5 && "border-destructive/50 focus:ring-destructive/20"
                          )}
                        />
                        <Clock className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                      </div>
                      {newSessionData.plannedDuration < 5 && newSessionData.plannedDuration !== 0 && (
                        <p className="text-[8px] font-black uppercase tracking-widest text-destructive ml-1">Min 5 minutes required</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Session Title</label>
                    <Input
                      placeholder="What are you focusing on?"
                      value={newSessionData.title}
                      onChange={(e) =>
                        setNewSessionData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="h-12 md:h-14 lg:h-16 rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] bg-secondary/30 border-white/10 focus:ring-primary/20 font-bold text-sm md:text-base lg:text-lg px-4 md:px-5 lg:px-6"
                    />
                  </div>

                  <div className="space-y-2 md:space-y-3">
                    <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Session Goal (optional)</label>
                    <Textarea
                      placeholder="e.g., Complete 3 practice sets..."
                      value={newSessionData.description}
                      onChange={(e) =>
                        setNewSessionData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="h-20 md:h-24 lg:h-32 resize-none rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] bg-secondary/30 border-white/10 focus:ring-primary/20 font-medium p-4 md:p-5 lg:p-6 text-sm"
                    />
                  </div>

                  <div className="bg-primary/5 p-5 md:p-6 lg:p-8 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] border border-primary/10 space-y-4 md:space-y-6">
                    <div className="flex justify-between items-end">
                      <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary">Session Length</label>
                      <span className="text-xl md:text-2xl lg:text-3xl font-black text-primary">{newSessionData.plannedDuration}<span className="text-[10px] md:text-xs lg:text-sm text-primary/40 ml-1">MIN</span></span>
                    </div>
                    <Slider
                      value={[newSessionData.plannedDuration]}
                      onValueChange={(v) =>
                        setNewSessionData((prev) => ({
                          ...prev,
                          plannedDuration: v[0],
                        }))
                      }
                      max={180}                    min={5}
                      step={5}
                      className="py-2 md:py-3 lg:py-4"
                    />
                    <div className="flex justify-between text-[8px] md:text-[10px] font-black text-primary/40 uppercase tracking-[0.2em]">
                      <span>Quick Burst</span>
                      <span>Deep Focus</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingSession(false)}
                    className="w-full sm:flex-1 h-12 md:h-14 lg:h-16 rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs border-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    disabled={loading || !newSessionData.title || newSessionData.plannedDuration < 5}
                    className="w-full sm:flex-[2] h-12 md:h-14 lg:h-16 rounded-[1rem] md:rounded-[1.2rem] lg:rounded-[1.5rem] bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:shadow-2xl hover:shadow-primary/40 transition-all duration-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Launching..." : "Ignite Session"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Previous Sessions List */}
      <div className="pt-8 md:pt-10 lg:pt-12 space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 px-1">
          <div className="space-y-1">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-3 md:gap-4 text-foreground">
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              Session History
            </h3>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Track your recent deep work sessions
            </p>
          </div>
          <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-secondary/50 border border-border/50 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
            {sessions.length} Sessions
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <div 
                key={session.id} 
                className="group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] p-0.5 transition-all duration-500 hover:scale-[1.01]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-border/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-[1.4rem] md:rounded-[1.9rem] p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all">
                  <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                    session.status === 'completed' ? "bg-primary/10 text-primary ring-1 ring-primary/20" : "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20"
                  )}>
                    {session.status === 'completed' ? <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8" /> : <Clock className="h-6 w-6 md:h-8 md:w-8" />}
                  </div>

                  <div className="flex-1 space-y-1 md:space-y-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                      <h4 className="text-base md:text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {session.title}
                      </h4>
                      <span className="inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-secondary text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground w-fit mx-auto md:mx-0">
                        {session.subject}
                      </span>
                    </div>
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {new Date(session.startTime.toDate()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex flex-col items-center md:items-end gap-1 md:gap-2 shrink-0">
                    <p className="text-xl md:text-2xl font-black text-foreground tracking-tighter">
                      {formatTime(session.duration)}
                    </p>
                    {session.focusLevel && (
                      <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <Zap className="h-2.5 w-2.5 md:h-3 md:w-3 text-amber-500 fill-current" />
                        <span className="text-[8px] md:text-[10px] font-black text-amber-600 tracking-widest">{session.focusLevel}/10</span>
                      </div>
                    )}
                  </div>

                  {session.topics && session.topics.length > 0 && (
                    <div className="hidden lg:flex flex-wrap gap-2 max-w-[200px] justify-end">
                      {session.topics.slice(0, 2).map((topic) => (
                        <span
                          key={topic}
                          className="px-3 py-1 bg-secondary/50 text-muted-foreground border border-border/50 rounded-lg text-[10px] font-black uppercase tracking-widest"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 md:py-24 bg-secondary/20 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-border/50 flex flex-col items-center gap-4 md:gap-6">
              <div className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-secondary/50 ring-1 ring-border/50">
                <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground/30" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <p className="text-lg md:text-xl font-black uppercase tracking-widest text-muted-foreground/50">
                  No sessions found
                </p>
                <p className="text-xs md:text-sm font-bold text-muted-foreground/40">
                  Time to start your first deep work session!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
