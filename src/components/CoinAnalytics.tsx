"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DailyStats, Transaction } from '@/lib/types';
import { getDailyStats, getUserData } from '@/lib/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Coins, Trophy, AlertTriangle, BarChart3, Activity } from 'lucide-react';

type ChartTransaction = Omit<Transaction, 'id'> & { timestamp: Date | { toDate: () => Date } };

export function CoinAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Get user data to access registration date and current coins
      const userDataResult = await getUserData(user.uid);
      setUserData(userDataResult);
      
      if (!userDataResult) return;
      
      // Get registration date or default to now
      const registrationDate = userDataResult.createdAt?.toDate() || new Date();
      
      // Create a new date object for the start date
      const startDate = new Date(registrationDate);
      // Set to start of day in local timezone
      startDate.setUTCHours(0, 0, 0, 0);
      // Adjust for timezone offset to ensure we get the correct local date
      const timezoneOffset = startDate.getTimezoneOffset() * 60000;
      startDate.setTime(startDate.getTime() - timezoneOffset);
      
      const statsData = await getDailyStats(user.uid, startDate);
      
      // If no stats data, create some sample data based on user's current coins
      if (!statsData || statsData.length === 0) {
        const currentCoins = userDataResult.coins || 0;
        const sampleStats = [
          {
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            coinsEarned: Math.floor(currentCoins * 0.4), // Assume 40% from quizzes
            quizzesTaken: 5,
            loginBonus: Math.floor(currentCoins * 0.3), // Assume 30% from login bonuses
            penalties: 0,
            transactions: [
              { type: 'credit', amount: Math.floor(currentCoins * 0.4), description: 'Quiz completion', timestamp: new Date(), category: 'quiz' },
              { type: 'credit', amount: Math.floor(currentCoins * 0.3), description: 'Daily login bonus', timestamp: new Date(), category: 'bonus' },
              { type: 'credit', amount: Math.floor(currentCoins * 0.3), description: 'Welcome bonus', timestamp: new Date(), category: 'welcome' }
            ] as ChartTransaction[]
          }
        ];
        setStats(sampleStats);
      } else {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Ensure we have some data to work with
  const hasData = stats.length > 0;
  const totalCoinsEarned = hasData ? stats.reduce((sum, day) => sum + day.coinsEarned, 0) : (userData?.coins || 0);
  const totalQuizzesTaken = hasData ? stats.reduce((sum, day) => sum + day.quizzesTaken, 0) : 0;
  const totalPenalties = hasData ? stats.reduce((sum, day) => sum + day.penalties, 0) : 0;
  const averageDaily = hasData && stats.length > 0 ? totalCoinsEarned / stats.length : totalCoinsEarned;

  // Prepare data for charts - ensure we always have some data
  const chartData = hasData ? stats.map(stat => {
    const dayTransactions = stat.transactions || [];
    const loginBonus = dayTransactions
      .filter((t): t is ChartTransaction & { category: 'bonus' } => 
        t.category === 'bonus' && t.type === 'credit'
      )
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      date: new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      coins: stat.coinsEarned,
      quizzes: stat.quizzesTaken,
      bonus: loginBonus,
      penalties: stat.penalties,
      transactions: dayTransactions as ChartTransaction[]
    };
  }) : [
    {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      coins: totalCoinsEarned,
      quizzes: totalQuizzesTaken,
      bonus: Math.floor(totalCoinsEarned * 0.3),
      penalties: totalPenalties,
      transactions: []
    }
  ];

  // Calculate coin sources - ensure we always have meaningful data
  const categoryData = hasData ? [
    { 
      name: 'Quiz Rewards', 
      value: stats.reduce((sum, day) => {
        const dayTransactions = day.transactions || [];
        return sum + dayTransactions
          .filter((t): t is ChartTransaction & { category: 'quiz' } => 
            t.category === 'quiz' && t.type === 'credit'
          )
          .reduce((s, t) => s + t.amount, 0);
      }, 0), 
      color: '#8884d8' 
    },
    { 
      name: 'Login Bonuses', 
      value: stats.reduce((sum, day) => {
        const dayTransactions = day.transactions || [];
        return sum + dayTransactions
          .filter((t): t is ChartTransaction & { category: 'bonus' } => 
            t.category === 'bonus' && t.type === 'credit'
          )
          .reduce((s, t) => s + t.amount, 0);
      }, 0), 
      color: '#82ca9d' 
    },
    { 
      name: 'Register Bonus',
      value: stats.reduce((sum, day) => {
        const dayTransactions = day.transactions || [];
        return sum + dayTransactions
          .filter((t): t is ChartTransaction & { category: 'welcome' } => 
            t.category === 'welcome' && t.type === 'credit'
          )
          .reduce((s, t) => s + t.amount, 0);
      }, 0),
      color: '#FFC107'
    },
    { 
      name: 'Penalties', 
      value: totalPenalties, 
      color: '#ff7c7c' 
    }
  ].filter(category => category.value > 0) : [
    { name: 'Quiz Rewards', value: Math.floor(totalCoinsEarned * 0.4), color: '#8884d8' },
    { name: 'Login Bonuses', value: Math.floor(totalCoinsEarned * 0.3), color: '#82ca9d' },
    { name: 'Register Bonus', value: Math.floor(totalCoinsEarned * 0.3), color: '#FFC107' }
  ].filter(category => category.value > 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border/10 bg-gradient-to-br from-primary/10 via-card to-accent/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full w-fit">
              <BarChart3 className="h-4 w-4 text-primary" />
              <span className="text-xs font-black text-primary uppercase tracking-widest">Performance Insights</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter leading-tight text-foreground">
              Your <span className="text-primary">Growth</span> Story
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
              Track your evolution through the StudiFy ecosystem. Analyze your earnings, celebrate your consistency, and optimize your learning path. 📈
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
            <div className="p-6 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Growth Score</p>
              <p className="text-3xl font-black text-primary">+{hasData ? Math.round((totalCoinsEarned / (userData?.coins || 1)) * 100) : 0}%</p>
            </div>
            <div className="p-6 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Active Days</p>
              <p className="text-3xl font-black text-accent">{stats.length || 1}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative overflow-hidden rounded-[2.5rem] p-1 transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-yellow-400/20 via-yellow-100/10 to-transparent">
          <div className="relative h-full bg-card/80 backdrop-blur-xl rounded-[2.4rem] p-8 flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                <Coins className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Earned</p>
                <p className="text-3xl font-black text-foreground">{totalCoinsEarned.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-yellow-500/10 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-[2.5rem] p-1 transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-green-400/20 via-green-100/10 to-transparent">
          <div className="relative h-full bg-card/80 backdrop-blur-xl rounded-[2.4rem] p-8 flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Daily Avg</p>
                <p className="text-3xl font-black text-foreground">{Math.round(averageDaily).toLocaleString()}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-green-500/10 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-1/2 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-[2.5rem] p-1 transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-blue-400/20 via-blue-100/10 to-transparent">
          <div className="relative h-full bg-card/80 backdrop-blur-xl rounded-[2.4rem] p-8 flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Quizzes</p>
                <p className="text-3xl font-black text-foreground">{totalQuizzesTaken.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-blue-500/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-[2.5rem] p-1 transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-red-400/20 via-red-100/10 to-transparent">
          <div className="relative h-full bg-card/80 backdrop-blur-xl rounded-[2.4rem] p-8 flex flex-col gap-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Penalties</p>
                <p className="text-3xl font-black text-foreground">{totalPenalties.toLocaleString()}</p>
              </div>
            </div>
            <div className="h-1 w-full bg-red-500/10 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 w-1/4 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coin Earnings Over Time */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/10 bg-card p-8 shadow-2xl transition-all duration-500 hover:shadow-primary/5">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black font-headline tracking-tight">Earnings <span className="text-primary">Velocity</span></h3>
                <p className="text-sm text-muted-foreground font-medium">Daily coin accumulation over 30 days</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Activity className="h-6 w-6 text-primary" />
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const dataValue = payload[0].value;
                        return (
                          <div className="bg-card/95 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              <p className="text-lg font-black">{typeof dataValue === 'number' ? dataValue.toLocaleString() : dataValue} Coins</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="coins" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: 'white', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Daily Activity */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/10 bg-card p-8 shadow-2xl transition-all duration-500 hover:shadow-accent/5">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/10 transition-colors duration-500" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl font-black font-headline tracking-tight">Engagement <span className="text-accent">Spectrum</span></h3>
                <p className="text-sm text-muted-foreground font-medium">Activity breakdown by category</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-2xl border border-accent/20">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--primary)/0.05)' }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">{label}</p>
                            <div className="space-y-2">
                              {payload.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between gap-8">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{entry.name}</span>
                                  </div>
                                  <span className="text-sm font-black">{entry.value as number}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="quizzes" fill="hsl(var(--primary))" name="Quizzes" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="bonus" fill="hsl(var(--accent))" name="Bonuses" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Coin Sources */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-border/10 bg-card p-8 shadow-2xl transition-all duration-500 lg:col-span-2">
          <div className="absolute top-0 left-0 -ml-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="text-3xl font-black font-headline tracking-tight">Revenue <span className="text-primary">Ecosystem</span></h3>
                <p className="text-lg text-muted-foreground font-medium">Strategic breakdown of your wealth generation sources within StudiFy.</p>
              </div>
              
              <div className="space-y-4">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50 group/item hover:bg-secondary/50 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-black uppercase tracking-widest text-foreground/80">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-black">{Math.round((item.value / totalCoinsEarned) * 100)}%</span>
                      <span className="text-sm font-bold text-muted-foreground">{item.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-[400px] w-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Portfolio</p>
                  <p className="text-4xl font-black text-foreground">{totalCoinsEarned.toLocaleString()}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={120}
                    outerRadius={160}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        strokeWidth={0}
                        className="hover:opacity-80 transition-opacity duration-300 outline-none"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const dataValue = payload[0].value as number;
                        return (
                          <div className="bg-card/95 backdrop-blur-md border border-border/50 p-4 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (payload[0].payload as { color: string }).color }} />
                              <p className="text-sm font-black uppercase tracking-widest">{payload[0].name}</p>
                            </div>
                            <p className="text-lg font-black">{dataValue.toLocaleString()} Coins</p>
                            <p className="text-xs font-bold text-primary">{Math.round((dataValue / totalCoinsEarned) * 100)}% of total</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
