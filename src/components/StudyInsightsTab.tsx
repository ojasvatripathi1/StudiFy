'use client';

import { useState, useEffect, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import {
  getLatestSessionInsight,
  getUserSessionInsights,
  calculateDailyInsights,
  calculateWeeklyInsights,
  calculateMonthlyInsights,
  saveSessionInsight,
} from '@/lib/studySessionFirebase';
import { SessionInsight } from '@/lib/studySessionTypes';
import { Button } from '@/components/ui/button';
import {
  Target,
  Clock,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  Zap,
  Award,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { cn } from '@/lib/utils';

export default function StudyInsightsTab() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [insights, setInsights] = useState<SessionInsight | null>(null);
  const [allInsights, setAllInsights] = useState<SessionInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const loadInsights = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const latest = await getLatestSessionInsight(user.uid, period);
      setInsights(latest);

      const all = await getUserSessionInsights(user.uid, period, 12);
      setAllInsights(all);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => {
    if (user) {
      loadInsights();
    }
  }, [user, loadInsights]);

  const handleGenerateInsights = async () => {
    if (!user?.uid) return;

    try {
      setGeneratingInsights(true);
      let insightData;

      const now = Timestamp.now();
      const date = new Date(now.toDate());

      if (period === 'daily') {
        insightData = await calculateDailyInsights(user.uid, now);
      } else if (period === 'weekly') {
        date.setDate(date.getDate() - date.getDay()); // Start of week
        insightData = await calculateWeeklyInsights(user.uid, Timestamp.fromDate(date));
      } else {
        date.setDate(1); // Start of month
        insightData = await calculateMonthlyInsights(user.uid, Timestamp.fromDate(date));
      }

      const savedInsight = await saveSessionInsight(user.uid, insightData);
      setInsights(savedInsight);
      await loadInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const prepareChartData = () => {
    if (!insights?.subjectStats) return [];

    return Object.entries(insights.subjectStats).map(([subject, stats]) => ({
      name: subject.charAt(0).toUpperCase() + subject.slice(1),
      sessions: stats.sessions || 0,
      totalTime: stats.totalTime || 0,
      focusLevel: stats.averageFocusLevel || 0,
      productivity: stats.averageProductivity || 0,
    }));
  };

  const prepareTrendData = () => {
    return allInsights.slice(0, 7).reverse().map((insight) => ({
      date: new Date(insight.date.toDate()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      totalTime: insight.totalStudyTime,
      focusLevel: insight.averageFocusLevel,
      productivity: insight.averageProductivity,
      sessions: insight.totalSessions,
    }));
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    color,
    trend,
    description,
  }: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    unit?: string;
    color: string;
    trend?: { value: number; isUp: boolean };
    description?: string;
  }) => (
    <div className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
      <div className={cn("absolute inset-0 opacity-10", color)} />
      <div className="relative bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-8 flex flex-col gap-6 shadow-2xl border border-white/5">
        <div className="flex items-start justify-between">
          <div className={cn(
            "p-4 rounded-[1.2rem] shadow-xl ring-1 ring-white/10 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700",
            color,
            "text-white"
          )}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1 shadow-lg border",
              trend.isUp ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
            )}>
              {trend.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-4xl font-black text-foreground tracking-tighter uppercase">
              {value}
            </h3>
            {unit && <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">{unit}</span>}
          </div>
        </div>

        {description && (
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  if (loading && !insights) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-primary animate-pulse">
          Analyzing Patterns...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Period Selection and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="bg-secondary/30 backdrop-blur-xl p-1.5 rounded-[1.5rem] border border-border/50 flex gap-1">
          {['daily', 'weekly', 'monthly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as 'daily' | 'weekly' | 'monthly')}
              className={cn(
                "px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                period === p 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <Button
          onClick={handleGenerateInsights}
          disabled={generatingInsights}
          className="h-14 px-8 rounded-[1.2rem] bg-card/80 backdrop-blur-xl border border-border/50 hover:bg-secondary/50 text-foreground font-black uppercase tracking-[0.2em] text-[10px] shadow-sm hover:shadow-xl transition-all duration-500 gap-3"
          variant="outline"
        >
          <RefreshCw className={cn("h-4 w-4 text-primary", generatingInsights && "animate-spin")} />
          {generatingInsights ? 'Synchronizing...' : 'Refresh Data'}
        </Button>
      </div>

      {insights && insights.createdAt && (insights.createdAt as Timestamp).toDate && (
        <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 -mt-8">
          <Clock className="h-3 w-3" />
          Synced: {(insights.createdAt as Timestamp).toDate().toLocaleString()}
        </div>
      )}

      {/* No Data State */}
      {!insights || (insights.totalSessions === 0 && period === 'daily') ? (
        <div className="group relative overflow-hidden rounded-[3rem] p-1 bg-gradient-to-br from-border/50 via-transparent to-transparent">
          <div className="relative bg-card/50 backdrop-blur-xl rounded-[2.9rem] py-24 px-12 text-center border border-white/5">
            <div className="relative mx-auto w-32 h-32 mb-12">
              <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] rotate-12 group-hover:rotate-45 transition-transform duration-700" />
              <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] -rotate-12 group-hover:-rotate-45 transition-transform duration-700" />
              <div className="relative w-full h-full bg-card rounded-[2.5rem] shadow-xl border border-white/10 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <h3 className="text-3xl font-black uppercase tracking-tight text-foreground mb-4">
              Quiet on the front
            </h3>
            <p className="text-sm font-medium text-muted-foreground mb-12 max-w-md mx-auto leading-relaxed">
              {period === 'daily'
                ? "You haven't completed any study sessions today. Time to break the silence and sharpen your skills."
                : `No deep work patterns detected for this ${period}. Consistency is the bridge between goals and accomplishment.`}
            </p>
            
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              className="h-16 px-12 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] hover:shadow-2xl hover:shadow-primary/40 transition-all duration-500"
            >
              Start Session
            </Button>
          </div>
        </div>
      ) : (
        <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={Clock}
          label="Total Focus"
          value={insights.totalStudyTime}
          unit="HRS"
          color="bg-primary"
          description="Active learning duration"
        />
        <StatCard
          icon={Target}
          label="Completed"
          value={insights.totalSessions}
          unit="SESSIONS"
          color="bg-emerald-500"
          description="Successfully closed blocks"
        />
        <StatCard
          icon={Zap}
          label="Concentration"
          value={insights.averageFocusLevel}
          unit="/10"
          color="bg-amber-500"
          description="Average focus intensity"
        />
        <StatCard
          icon={Award}
          label="Precision"
          value={`${insights.consistencyScore}%`}
          color="bg-violet-500"
          description="Plan vs execution rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Subject Performance */}
        <div className="lg:col-span-2 group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-0.5 md:p-1 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50" />
          <div className="relative bg-card/80 backdrop-blur-xl rounded-[1.8rem] md:rounded-[2.4rem] p-6 md:p-10 shadow-xl border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
              <div className="space-y-1">
                <div className="flex items-center gap-2 md:gap-3 text-primary">
                  <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                    <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Performance Metrics</span>
                </div>
                <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-foreground">
                  Subject Mastery
                </h3>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Quality and duration across disciplines
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-primary" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-500" />
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Focus</span>
                </div>
              </div>
            </div>

            <div className="h-[250px] md:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareChartData()} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6"/>
                        </linearGradient>
                        <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.6"/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af', textAnchor: 'middle' }}
                        dy={10}
                      />
                      <YAxis 
                        yAxisId="left" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }}
                      />
                      <YAxis yAxisId="right" orientation="right" hide />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                          backdropFilter: 'blur(12px)',
                          borderRadius: '20px', 
                          border: '1px solid rgba(255, 255, 255, 0.2)', 
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                          padding: '16px'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      />
                      <Bar yAxisId="left" dataKey="totalTime" fill="url(#colorTime)" radius={[8, 8, 0, 0]} name="Hours" barSize={40} />
                      <Bar
                        yAxisId="right"
                        dataKey="focusLevel"
                        fill="url(#colorFocus)"
                        name="Focus"
                        radius={[4, 4, 0, 0]}
                        barSize={12}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Peak Time Analysis */}
            <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-0.5 md:p-1 transition-all duration-500 hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient shadow-2xl" />
              <div className="relative h-full bg-card/10 backdrop-blur-md rounded-[1.8rem] md:rounded-[2.4rem] p-6 md:p-10 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl" />
                
                <div className="relative space-y-2">
                  <div className="flex items-center gap-2 md:gap-3 text-white/80">
                    <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Insights</span>
                  </div>
                  <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white">
                    Peak Performance
                  </h3>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/60">
                    Your optimal deep work window
                  </p>
                </div>

                {insights.bestTimeOfDay ? (
                  <div className="relative flex flex-col items-center py-6 md:py-12">
                    <div className="relative w-24 h-24 md:w-40 md:h-40 mb-6 md:mb-8 flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-20" />
                      <div className="absolute inset-4 bg-white/20 rounded-full blur-xl" />
                      <div className="relative w-full h-full bg-white/10 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center shadow-2xl ring-1 ring-white/50">
                        <Clock className="h-10 w-10 md:h-16 md:w-16 text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center space-y-1">
                      <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        {insights.bestTimeOfDay.hour}:00
                      </h3>
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/60">
                        PRIME FOCUS WINDOW
                      </p>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-3 md:gap-4 mt-8 md:mt-12">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                        <p className="text-[8px] md:text-[10px] uppercase font-black text-white/60 tracking-widest mb-1">Focus</p>
                        <p className="text-xl md:text-2xl font-black text-white">{insights.bestTimeOfDay.focusLevel}<span className="text-[10px] md:text-xs opacity-40">/10</span></p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 md:p-4 rounded-xl md:rounded-2xl text-center">
                        <p className="text-[8px] md:text-[10px] uppercase font-black text-white/60 tracking-widest mb-1">Efficiency</p>
                        <p className="text-xl md:text-2xl font-black text-white">{insights.bestTimeOfDay.productivity}<span className="text-[10px] md:text-xs opacity-40">/10</span></p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 md:py-24 text-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 md:mb-6 animate-pulse">
                      <Clock className="h-6 w-6 md:h-8 md:w-8 text-white/40" />
                    </div>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40 max-w-[150px] md:max-w-none">
                      Awaiting more data to pinpoint your peak focus time
                    </p>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* AI Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1 space-y-6 md:space-y-8">
            <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-0.5 md:p-1 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-transparent opacity-50" />
              <div className="relative bg-card/80 backdrop-blur-xl rounded-[1.8rem] md:rounded-[2.4rem] p-6 md:p-8 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="p-2 md:p-3 rounded-xl bg-primary/10">
                    <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground">Pro Tips</h3>
                </div>
                <div className="space-y-4 md:space-y-6">
                  {insights.recommendations.slice(0, 3).map((rec, idx) => (
                    <div key={idx} className="flex gap-3 md:gap-4 group/item">
                      <div className="h-5 w-5 md:h-6 md:w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-[8px] md:text-[10px] font-black mt-0.5 group-hover/item:scale-110 transition-transform">
                        {idx + 1}
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground leading-relaxed font-bold uppercase tracking-wide">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-0.5 md:p-1 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 via-transparent to-transparent opacity-50" />
              <div className="relative bg-card/80 backdrop-blur-xl rounded-[1.8rem] md:rounded-[2.4rem] p-6 md:p-8 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="p-2 md:p-3 rounded-xl bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-emerald-500" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground">Successes</h3>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {insights.improvements?.map((imp, idx) => (
                    <div key={idx} className="flex items-center gap-3 md:gap-4 group/item">
                      <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-emerald-500 group-hover/item:scale-150 transition-transform" />
                      <p className="text-[10px] md:text-xs text-muted-foreground font-black uppercase tracking-widest">{imp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {/* Momentum & Trends Section */}
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-0.5 md:p-1 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/20 opacity-50" />
                <div className="relative bg-card/80 backdrop-blur-xl rounded-[1.8rem] md:rounded-[2.4rem] p-6 md:p-10 border border-white/10 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 md:gap-3 text-accent">
                        <div className="p-1.5 md:p-2 rounded-lg bg-accent/10">
                          <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Momentum</span>
                      </div>
                      <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-foreground">
                        Learning Velocity
                      </h3>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Time and quality trends over 7 periods
                      </p>
                    </div>
                  </div>

                  <div className="h-[250px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={prepareTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="hsl(var(--primary))" />
                                <stop offset="100%" stopColor="hsl(var(--accent))" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis 
                              dataKey="date" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }}
                              dy={10}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                                backdropFilter: 'blur(12px)',
                                borderRadius: '20px', 
                                border: '1px solid rgba(255, 255, 255, 0.2)', 
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                padding: '16px'
                              }}
                              itemStyle={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                            />
                            <Line
                              type="monotone"
                              dataKey="totalTime"
                              stroke="url(#lineGradient)"
                              strokeWidth={4}
                              dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {/* Consistency Trend */}
                    <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-0.5 md:p-1 transition-all duration-500">
                      <div className={cn(
                        "absolute inset-0 opacity-20 bg-gradient-to-br",
                        insights.improvementTrend === 'improving' ? "from-emerald-500 to-teal-500" : "from-amber-500 to-orange-500"
                      )} />
                      <div className="relative bg-card/80 backdrop-blur-xl rounded-[1.8rem] md:rounded-[2.4rem] p-6 md:p-8 border border-white/10 shadow-xl">
                        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                          <div className={cn(
                            "p-2 md:p-3 rounded-xl",
                            insights.improvementTrend === 'improving' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                          )}>
                            {insights.improvementTrend === 'improving' ? <TrendingUp className="h-5 w-5 md:h-6 md:w-6" /> : <Target className="h-5 w-5 md:h-6 md:w-6" />}
                          </div>
                          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground">Efficiency</h3>
                        </div>
                        
                        <div className="space-y-4 md:space-y-6">
                          <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground leading-relaxed">
                            {insights.improvementTrend === 'improving'
                              ? 'Positive momentum detected. You are studying more effectively than before!'
                              : 'Consistent stability. Maintain this rhythm to achieve your long-term goals.'}
                          </p>
                          
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex justify-between items-end">
                              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Consistency Score</span>
                              <span className="text-xl md:text-2xl font-black text-foreground">{insights.consistencyScore}%</span>
                            </div>
                            <div className="h-2.5 md:h-3 w-full bg-secondary/50 rounded-full overflow-hidden p-0.5">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  insights.consistencyScore >= 80 ? "bg-emerald-500" : "bg-primary"
                                )}
                                style={{ width: `${insights.consistencyScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Break Analysis */}
                    <div className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-0.5 md:p-1 transition-all duration-500">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent opacity-50" />
                      <div className="relative bg-card/80 backdrop-blur-xl rounded-[1.8rem] md:rounded-[2.4rem] p-6 md:p-8 border border-white/10 shadow-xl">
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                          <div className="p-2 md:p-3 rounded-xl bg-violet-500/10 text-violet-500">
                            <RefreshCw className="h-5 w-5 md:h-6 md:w-6" />
                          </div>
                          <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-foreground">Recovery</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                          <div className="space-y-1">
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Intervals</p>
                            <p className="text-2xl md:text-3xl font-black text-foreground">{insights.avgBreaksPerSession}</p>
                            <p className="text-[8px] font-bold uppercase text-muted-foreground/60">Per Session</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Duration</p>
                            <p className="text-2xl md:text-3xl font-black text-foreground">{insights.avgBreakDuration}<span className="text-[10px] md:text-xs ml-1 opacity-40">M</span></p>
                            <p className="text-[8px] font-bold uppercase text-muted-foreground/60">Avg length</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}
