"use client";

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Zap, 
  GraduationCap, 
  ArrowRight, 
  BrainCircuit, 
  Trophy, 
  BookOpen, 
  Layers, 
  Star,
  CheckCircle2,
  FileText,
  MessageSquare,
  Timer
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background overflow-hidden relative selection:bg-primary/30 selection:text-primary-foreground">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-accent/20 rounded-full blur-[120px] mix-blend-screen animate-float-delayed"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-float"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary rounded-full blur-[2px] animate-float opacity-50"></div>
        <div className="absolute top-1/3 right-1/4 w-4 h-4 bg-accent rounded-full blur-[2px] animate-float-delayed opacity-40"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-primary rounded-full blur-[1px] animate-bounce-gentle opacity-60"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-[1rem] ring-1 ring-primary/20">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tight text-foreground">
              Studi<span className="text-primary">Fy</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-bold tracking-wide rounded-full px-6 hover:bg-primary/10 hover:text-primary transition-colors">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="btn-primary rounded-full px-8 font-bold tracking-wide">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content */}
            <motion.div 
              className="flex-1 space-y-8 text-center lg:text-left z-10"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full shadow-lg shadow-primary/5">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">The Future of Learning</span>
              </motion.div>
              
              <motion.h1 variants={fadeIn} className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-[1.1]">
                Gamify Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient">
                  Study Sessions
                </span>
              </motion.h1>
              
              <motion.p variants={fadeIn} className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-medium">
                Transform your notes and PDFs into interactive quizzes, compete on the leaderboard, and learn 10x faster with our AI-powered study assistant.
              </motion.p>
              
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                <Button onClick={() => router.push('/signup')} size="lg" className="h-14 px-8 w-full sm:w-auto text-lg rounded-full btn-primary group">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button onClick={() => router.push('/login')} size="lg" variant="outline" className="h-14 px-8 w-full sm:w-auto text-lg rounded-full border-primary/20 bg-background/50 hover:bg-primary/10 hover:text-primary transition-all">
                  View Demo
                </Button>
              </motion.div>
              
              <motion.div variants={fadeIn} className="flex items-center justify-center lg:justify-start gap-6 pt-6 opacity-80">
                <div className="flex -space-x-3">
                  {['Felix', 'Aneka', 'Oliver', 'Zoe'].map((name, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center overflow-hidden relative">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf`} alt="User" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold text-foreground">
                  Join <span className="text-primary">10,000+</span> Top Performers
                </div>
              </motion.div>
            </motion.div>

            {/* Right Interactive Mockup */}
            <motion.div 
              className="flex-1 w-full max-w-lg lg:max-w-none relative z-10 hidden md:block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative w-full aspect-[4/3] rounded-[2rem] glass p-4 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                
                {/* Mockup UI Elements */}
                <div className="h-full w-full rounded-[1.5rem] bg-card border border-white/10 p-5 flex flex-col gap-5 relative overflow-hidden shadow-inner">
                  
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Prodigy&backgroundColor=b6e3f4" alt="User" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">Daily Quiz</div>
                        <div className="text-xs text-muted-foreground font-medium">Computer Science</div>
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center gap-1 border border-primary/20">
                      <Zap className="h-3 w-3" />
                      1,250 
                    </div>
                  </div>
                  
                  {/* Mockup Body: Quiz Question */}
                  <div className="flex-1 flex flex-col gap-4">
                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                         <span>Question 3 of 5</span>
                         <span className="text-amber-500 flex items-center gap-1"><Timer className="h-3 w-3" /> 00:45</span>
                       </div>
                       <h4 className="text-base sm:text-lg font-black leading-snug text-foreground">
                         What is the time complexity of quicksort in the worst-case scenario?
                       </h4>
                    </div>
                    
                    {/* Quiz Options */}
                    <div className="grid grid-cols-1 gap-2 mt-auto">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-secondary/20 font-medium text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-bold">A</div>
                        O(n log n)
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-primary bg-primary/10 font-bold text-sm text-foreground relative overflow-hidden shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-black relative z-10"><CheckCircle2 className="h-4 w-4" /></div>
                        <span className="relative z-10">O(n²)</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-secondary/20 font-medium text-sm text-muted-foreground">
                        <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-bold">C</div>
                        O(n)
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating Badges */}
                <motion.div 
                  className="absolute -right-6 top-16 glass border border-white/10 p-3 pr-5 rounded-2xl shadow-2xl flex items-center gap-3 bg-background/90"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="bg-emerald-500/20 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground">Quiz Master</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Achievement Unlocked</div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -left-6 bottom-16 glass border border-white/10 p-3 pr-5 rounded-2xl shadow-2xl flex items-center gap-3 bg-background/90"
                  animate={{ y: [10, -10, 10] }}
                  transition={{ delay: 1, duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="bg-amber-500/20 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground">7 Day Streak!</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">+50 Bonus Coins</div>
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 relative bg-card/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Supercharge Your Mind</h2>
            <p className="text-muted-foreground text-lg">Everything you need to master your subjects, bundled into one powerful platform.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "PDF to Quiz",
                desc: "Upload any study material and let our AI instantly generate personalized quizzes.",
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                icon: BrainCircuit,
                title: "AI Study Assistant",
                desc: "Stuck on a concept? Chat with our AI tutor trained to help you understand, not just give answers.",
                color: "text-violet-500",
                bg: "bg-violet-500/10"
              },
              {
                icon: Trophy,
                title: "Gamified Learning",
                desc: "Earn coins, maintain streaks, and climb the global leaderboard as you study.",
                color: "text-amber-500",
                bg: "bg-amber-500/10"
              },
              {
                icon: BookOpen,
                title: "Standard Curriculum",
                desc: "Access a wide library of pre-made quizzes across various subjects like CS, Math, and Science.",
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              },
              {
                icon: Layers,
                title: "Flashcards & Notes",
                desc: "Organize your knowledge efficiently with built-in tools designed for active recall.",
                color: "text-rose-500",
                bg: "bg-rose-500/10"
              },
              {
                icon: Star,
                title: "Unlock Rewards",
                desc: "Spend your earned coins in the shop to customize your profile and unlock premium avatars.",
                color: "text-primary",
                bg: "bg-primary/10"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass p-8 rounded-[2rem] card-hover group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamification Spotlight */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-4xl lg:text-5xl font-black tracking-tight">Focus. Learn. Earn.</h2>
              <ul className="space-y-6">
                {[
                  { title: "Study Labs", desc: "Use the Pomodoro timer to maintain deep focus. Earn coins for every minute studied." },
                  { title: "Daily Puzzles", desc: "Solve the word of the day to keep your mind sharp and earn daily streak bonuses." },
                  { title: "Global Leaderboard", desc: "See how you stack up against learners worldwide. Push your limits." }
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="mt-1 bg-primary/20 p-1.5 rounded-full shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full"></div>
              <div className="relative glass p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Top Scholars</h3>
                  <Trophy className="text-accent h-8 w-8" />
                </div>
                <div className="space-y-4">
                  {[
                    { name: "Alex Chen", score: "8,450", color: "text-amber-400" },
                    { name: "Sarah Jenkins", score: "7,210", color: "text-zinc-300" },
                    { name: "You (Prodigy)", score: "6,900", color: "text-amber-600" }
                  ].map((user, i) => (
                    <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${i === 2 ? 'bg-primary/20 border border-primary/30' : 'bg-secondary/50'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`font-black text-xl w-6 ${user.color}`}>#{i+1}</div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold">{user.name[0]}</div>
                          <span className="font-bold">{user.name}</span>
                        </div>
                      </div>
                      <div className="font-bold text-primary flex items-center gap-1">
                        {user.score} <Zap className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer / Final CTA */}
      <footer className="relative pt-32 pb-10 px-6 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1/2 bg-primary/10 blur-[150px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10 mb-32">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight">Ready to Level Up?</h2>
          <p className="text-xl text-muted-foreground">Join thousands of students who are achieving their goals faster with StudiFy.</p>
          <div className="flex justify-center pt-4">
             <Button onClick={() => router.push('/signup')} size="lg" className="h-16 px-10 text-xl rounded-full btn-primary group shadow-2xl shadow-primary/30">
                Create Your Free Account
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
             </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-white/10 pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground relative z-10">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">StudiFy</span> &copy; {new Date().getFullYear()}. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
