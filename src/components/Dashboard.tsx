"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { UserData, Transaction, QuizCategory } from '@/lib/types';
import {
  getUserData,
  getLeaderboard,
  getUserRank,
  getTransactions,
  claimDailyBonus as claimBonusAction,
  checkLeaderboardChanges,
} from '@/lib/firebase';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { DailyBonusCard } from '@/components/DailyBonusCard';
import { DailyQuizCard } from '@/components/DailyQuizCard';
import { Leaderboard } from '@/components/Leaderboard';
import { TransactionHistory } from '@/components/TransactionHistory';
import { QuizCategoryCards } from '@/components/QuizCategoryCards';
import { CustomQuizzesGrid } from '@/components/CustomQuizzesGrid';
import { BadgeStore } from '@/components/BadgeStore';
import { NotificationCenter } from '@/components/NotificationCenter';
import { CoinAnalytics } from '@/components/CoinAnalytics';
import StudyAssistantChatbot from '@/components/StudyAssistantChatbot';
import StudySessionTab from '@/components/StudySessionTab';
import StudyInsightsTab from '@/components/StudyInsightsTab';
import ShopTab from '@/components/ShopTab';
import CustomizationTab from '@/components/CustomizationTab';
import ProfileTab from '@/components/ProfileTab';
import { 
  LayoutDashboard, 
  FileText, 
  Timer, 
  Sparkles, 
  MessageSquare, 
  Trophy, 
  ShoppingBag, 
  BarChart3, 
  Bell, 
  Palette, 
  User,
  Zap,
  Menu,
  ChevronRight
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [claimLoading, setClaimLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isStudySessionActive, setIsStudySessionActive] = useState(false);

  const handleTabChange = (newTab: string) => {
    if (isStudySessionActive) {
      toast({
        title: "Study Session in Progress",
        description: "Please complete or stop your study session before navigating away.",
        variant: "destructive",
      });
      return;
    }
    setActiveTab(newTab);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quizzes', label: 'Quizzes', icon: FileText },
    { id: 'study-sessions', label: 'Study', icon: Timer },
    { id: 'insights', label: 'Insights', icon: Sparkles },
    { id: 'study-assistant', label: 'Study AI', icon: MessageSquare },
    { id: 'badges', label: 'Badges', icon: Trophy },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'customization', label: 'Customization', icon: Palette },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['dashboard', 'quizzes', 'study-sessions', 'insights', 'study-assistant', 'badges', 'shop', 'analytics', 'notifications', 'customization', 'profile'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const [quizResults, setQuizResults] = useState<Record<QuizCategory, { score: number; coinsEarned: number; correctAnswers: number; totalQuestions: number; timestamp: Date } | null>>({
    ds_algo: null,
    database: null,
    os: null,
    networks: null,
    math: null,
    aptitude: null,
    grammar: null,
    programming: null
  });

  useEffect(() => {
    if (!loading && user) {
      if (!user.emailVerified) {
        router.push('/verify-email');
        return;
      }
    }
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && userData && !userData.username && activeTab !== 'profile') {
      setActiveTab('profile');
      toast({
        title: "Setup Your Profile",
        description: "Please choose a username to start using StudiFy.",
      });
    }
  }, [user, userData, activeTab, toast]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const data = await getUserData(user.uid);
      if (data) {
        // Fetch rank, leaderboard, and transactions in parallel
        const [rank, leaders, userTransactions] = await Promise.all([
          getUserRank(user.uid, data.coins),
          getLeaderboard(),
          getTransactions(user.uid)
        ]);

        setUserData({ ...data, rank });
        setLeaderboard(leaders);
        setTransactions(userTransactions);
        // await checkLeaderboardChanges(); // Disabled: Requires server-side permissions
      } else {
        // If user is authenticated but no data exists, redirect to login to trigger creation
        // or we could trigger creation here. For now, let's logout to be safe.
        console.warn("User authenticated but no Firestore document found. Redirecting to login.");
        router.push('/login');
      }
    } catch (error: unknown) {
      console.error("Error fetching dashboard data:", error);
      if (error instanceof Error && error.message.includes('permission-denied')) {
        toast({
          title: "Permission Denied",
          description: "Please ensure Firestore Security Rules are set to 'allow read, write: if request.auth != null;'.",
          variant: 'destructive',
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const canClaimBonus = () => {
    if (!userData?.lastBonusClaimed) return true;
    const lastClaimDate = userData.lastBonusClaimed.toDate();
    const today = new Date();
    return lastClaimDate.toDateString() !== today.toDateString();
  };

  const handleClaimBonus = async () => {
    if (!user || !canClaimBonus()) return;
    setClaimLoading(true);
    try {
      await claimBonusAction(user.uid);
      const updatedUserData = await getUserData(user.uid);
      
      if (updatedUserData) {
        const rank = await getUserRank(user.uid, updatedUserData.coins);
        setUserData({ ...updatedUserData, rank });
      } else {
        setUserData(null);
      }
      
      const updatedTransactions = await getTransactions(user.uid);
      setTransactions(updatedTransactions);
      toast({
        title: "Daily Bonus Claimed!",
        description: "You've received 100 coins.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to claim daily bonus. Please try again.",
        variant: 'destructive',
      });
    } finally {
      setClaimLoading(false);
    }
  };

  const handleQuizComplete = async (category: QuizCategory, score: number, coinsEarned: number, totalQuestions: number = 5, correctAnswers: number = 0) => {
    if (!user) return;

    try {
      const updatedUserData = await getUserData(user.uid);
      
      if (updatedUserData) {
        const rank = await getUserRank(user.uid, updatedUserData.coins);
        setUserData({ ...updatedUserData, rank });
      } else {
        setUserData(null);
      }

      const updatedTransactions = await getTransactions(user.uid);
      const updatedLeaderboard = await getLeaderboard();

      setTransactions(updatedTransactions);
      setLeaderboard(updatedLeaderboard);

      // Store quiz result
      setQuizResults(prev => ({
        ...prev,
        [category]: {
          score,
          coinsEarned,
          correctAnswers,
          totalQuestions,
          timestamp: new Date()
        }
      }));

      toast({
        title: "Quiz Complete!",
        description: `You scored ${score}% and earned ${coinsEarned} coins!`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update data. Please refresh the page.",
        variant: 'destructive',
      });
    }
  };

  if (loading || !userData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="flex flex-col space-y-6 items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-3 text-center">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <Header 
        user={userData} 
        onProfileClick={() => handleTabChange('profile')} 
        onLogoClick={() => handleTabChange('dashboard')}
      />
      
      <main className="flex flex-1 flex-col gap-6 md:gap-10 p-4 md:p-8 max-w-[1600px] mx-auto w-full relative z-10 overflow-x-hidden">
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
            <div className="space-y-3 md:space-y-4 text-center lg:text-left">
              <div className="flex items-center gap-3 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full w-fit mx-auto lg:mx-0 shadow-lg shadow-primary/5">
                <Zap className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[7px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em]">Platform Active</span>
              </div>
              <div className="space-y-0.5 md:space-y-1">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
                  Welcome back, <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
                    {userData.displayName}
                  </span>! 👋
                </h1>
                <p className="text-muted-foreground text-[10px] md:text-sm max-w-xl font-bold uppercase tracking-[0.2em] opacity-70">
                  Ready to accelerate your learning journey today?
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 sm:gap-6 bg-card/50 backdrop-blur-3xl p-3 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-50" />
              <div className="relative flex flex-col items-center px-4 md:px-8 border-r border-white/5">
                <span className="text-xl md:text-3xl font-black text-primary mb-0.5">{userData.loginStreak || 0}</span>
                <span className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Day Streak</span>
              </div>
              <div className="relative flex flex-col items-center px-4 md:px-8">
                <span className="text-xl md:text-3xl font-black text-accent mb-0.5">{transactions.length}</span>
                <span className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em]">Milestones</span>
              </div>
            </div>
          </div>
        </section>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <div className="sticky top-16 md:top-20 z-40 py-2 overflow-x-auto scrollbar-hide">
            {/* Desktop Navigation */}
            <div className="hidden xl:block min-w-max px-4">
              <TabsList className="inline-flex h-auto p-1.5 px-3 bg-card/60 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] rounded-[1.8rem]">
                {navigationItems.map((item) => (
                  <TabsTrigger 
                    key={item.id}
                    value={item.id} 
                    className="rounded-[1.2rem] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_10px_20px_-5px_rgba(var(--primary),0.4)] transition-all duration-500 px-6 py-3 flex items-center gap-2.5 group shrink-0"
                  >
                    <item.icon className="h-3.5 w-3.5 transition-transform duration-500 group-hover:scale-110" />
                    <span className="font-black text-[9px] uppercase tracking-[0.15em]">{item.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Mobile/Compact Navigation */}
            <div className="xl:hidden flex items-center gap-4">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-20 bg-card/60 backdrop-blur-3xl border-white/10 shadow-2xl rounded-[2.2rem] flex items-center justify-between px-8 hover:bg-white/5 transition-all duration-500 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-[1.2rem] group-hover:scale-110 transition-transform duration-500">
                        <Menu className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-0.5">Navigation Context</p>
                        <span className="font-black text-lg uppercase tracking-tight text-foreground">
                          {navigationItems.find(item => item.id === activeTab)?.label || 'Navigation'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-[3.5rem] border-t-0 p-0 overflow-hidden bg-background/95 backdrop-blur-3xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                  <SheetHeader className="p-10 pb-6 border-b border-white/5 relative z-10">
                    <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                    <SheetTitle className="text-4xl font-black uppercase tracking-tight text-center">
                      Navigate <span className="text-primary">StudiFy</span>
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full px-8 py-10 relative z-10">
                    <div className="grid grid-cols-1 gap-5 pb-32">
                      {navigationItems.map((item) => (
                        <Button
                          key={item.id}
                          variant={activeTab === item.id ? "default" : "ghost"}
                          className={cn(
                            "w-full h-20 justify-start gap-6 px-8 rounded-[1.8rem] transition-all duration-500",
                            activeTab === item.id 
                              ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.02] border border-white/10" 
                              : "hover:bg-white/5 border border-transparent"
                          )}
                          onClick={() => {
                            handleTabChange(item.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <div className={cn(
                            "p-3.5 rounded-[1.2rem] transition-colors duration-500",
                            activeTab === item.id ? "bg-white/20" : "bg-primary/10"
                          )}>
                            <item.icon className={cn(
                              "h-6 w-6",
                              activeTab === item.id ? "text-white" : "text-primary"
                            )} />
                          </div>
                          <span className="text-xl font-black uppercase tracking-tight">{item.label}</span>
                          {activeTab === item.id && (
                            <div className="ml-auto w-3 h-3 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                          )}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-12 mt-0 animate-in fade-in duration-700">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <BalanceCard balance={userData.coins} />
              <DailyBonusCard
                onClaim={handleClaimBonus}
                canClaim={canClaimBonus()}
                loading={claimLoading}
                streak={userData.loginStreak}
              />
            </div>
            <div className="grid gap-8">
              <DailyQuizCard />
            </div>
            <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
              <Leaderboard users={leaderboard} currentUserId={user?.uid} />
              <TransactionHistory transactions={transactions} />
            </div>
          </TabsContent>

          <TabsContent value="quizzes" className="space-y-16 mt-0 animate-in fade-in duration-700">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-primary/10 text-primary ring-1 ring-primary/20">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Knowledge Assessment</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Quiz Terminal
                </h2>
              </div>
            </div>

            {/* Daily Challenge Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Objective</h3>
              </div>
              <div className="max-w-3xl">
                <DailyQuizCard />
              </div>
            </div>

            {/* Custom Quizzes Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Your Custom Quizzes</h3>
              </div>
              <CustomQuizzesGrid />
            </div>

            {/* Standard Quizzes Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Standard Curriculum</h3>
              </div>
              <QuizCategoryCards
                onQuizComplete={handleQuizComplete}
                userStreaks={userData.quizStreaks || {
                  ds_algo: 0,
                  database: 0,
                  os: 0,
                  networks: 0
                }}
                lastQuizDates={userData.lastQuizDates ? {
                  ds_algo: userData.lastQuizDates.ds_algo?.toDate() ?? null,
                  database: userData.lastQuizDates.database?.toDate() ?? null,
                  os: userData.lastQuizDates.os?.toDate() ?? null,
                  networks: userData.lastQuizDates.networks?.toDate() ?? null,
                  math: userData.lastQuizDates.math?.toDate() ?? null,
                  aptitude: userData.lastQuizDates.aptitude?.toDate() ?? null,
                  grammar: userData.lastQuizDates.grammar?.toDate() ?? null,
                  programming: userData.lastQuizDates.programming?.toDate() ?? null
                } : undefined}
                quizResults={quizResults}
              />
            </div>
          </TabsContent>

          <TabsContent value="study-sessions" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <Timer className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/70">Focus Management</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Study Lab
                </h2>
              </div>
            </div>
            <StudySessionTab onSessionActiveChange={setIsStudySessionActive} onSessionComplete={fetchData} />
          </TabsContent>

          <TabsContent value="insights" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500/70">Artificial Intelligence</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Learning Insights
                </h2>
              </div>
            </div>
            <StudyInsightsTab />
          </TabsContent>

          <TabsContent value="study-assistant" className="mt-0 h-[calc(100vh-120px)] min-h-[700px] animate-in fade-in duration-700 w-full max-w-none">
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-4 mb-4 shrink-0">
                <div className="p-3.5 rounded-[1.2rem] bg-primary/10 text-primary ring-1 ring-primary/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Artificial Intelligence</span>
                  <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                    Study Assistant
                  </h2>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <StudyAssistantChatbot userData={userData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/70">Achievements</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Badge Collection
                </h2>
              </div>
            </div>
            <BadgeStore />
          </TabsContent>


          <TabsContent value="shop" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-primary/10 text-primary ring-1 ring-primary/20">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Marketplace</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Coin Shop
                </h2>
              </div>
            </div>
            <ShopTab userData={userData} onPurchaseComplete={async () => {
              if (user) {
                const updatedUserData = await getUserData(user.uid);
                const updatedTransactions = await getTransactions(user.uid);
                setUserData(updatedUserData);
                setTransactions(updatedTransactions);
              }
            }} />
          </TabsContent>
          <TabsContent value="analytics" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-accent/10 text-accent ring-1 ring-accent/20">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent/70">Data Visualization</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Performance Analytics
                </h2>
              </div>
            </div>
            <CoinAnalytics />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
                <Bell className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/70">System Updates</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Notifications
                </h2>
              </div>
            </div>
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="customization" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-primary/10 text-primary ring-1 ring-primary/20">
                <Palette className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Visual Identity</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  Customization
                </h2>
              </div>
            </div>
            <CustomizationTab />
          </TabsContent>

          <TabsContent value="profile" className="mt-0 animate-in fade-in duration-700 space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-[1.2rem] bg-primary/10 text-primary ring-1 ring-primary/20">
                <User className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Account Settings</span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">
                  User Profile
                </h2>
              </div>
            </div>
            <ProfileTab user={userData} onUpdate={(updatedData) => setUserData(updatedData)} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
