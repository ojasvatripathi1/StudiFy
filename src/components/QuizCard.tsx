import { Button } from "@/components/ui/button";
import { BrainCircuit, Calculator, BookOpen, Code, Clock, Coins } from "lucide-react";

export type QuizCategory = 'math' | 'aptitude' | 'grammar' | 'programming';

type QuizCardProps = {
  category?: QuizCategory;
  onPlay: () => void;
};

const categoryConfig = {
  math: {
    title: 'Numerical Logic',
    description: 'Master arithmetic, algebra, and spatial reasoning.',
    icon: Calculator,
    gradient: 'from-blue-500 to-cyan-500',
    color: 'text-blue-500',
    sampleQuestions: [
      'What is 15% of 200?',
      'Solve: x² - 5x + 6 = 0',
      'What is the derivative of x³?'
    ]
  },
  aptitude: {
    title: 'Cognitive Flow',
    description: 'Challenge your pattern recognition and mental agility.',
    icon: BrainCircuit,
    gradient: 'from-purple-500 to-indigo-500',
    color: 'text-purple-500',
    sampleQuestions: [
      'If BOOK is coded as CPPL, how is WORD coded?',
      'Complete the series: 2, 6, 12, 20, ?',
      'What comes next: A1, C3, E5, G7, ?'
    ]
  },
  grammar: {
    title: 'Linguistic Arts',
    description: 'Refine your syntax, vocabulary, and linguistic precision.',
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-500',
    color: 'text-emerald-500',
    sampleQuestions: [
      'What is the past participle of "swim"?',
      'Choose the correct form: "I wish I _____ taller."',
      'Which sentence uses the subjunctive mood correctly?'
    ]
  },
  programming: {
    title: 'Digital Systems',
    description: 'Explore algorithms, logic structures, and code architecture.',
    icon: Code,
    gradient: 'from-orange-500 to-amber-500',
    color: 'text-orange-500',
    sampleQuestions: [
      'What does "HTML" stand for?',
      'What is the time complexity of binary search?',
      'In Python, what does the "yield" keyword do?'
    ]
  }
};

export function QuizCard({ category = 'math', onPlay }: QuizCardProps) {
  const config = categoryConfig[category];
  const IconComponent = config.icon;
  const sampleQuestion = config.sampleQuestions[Math.floor(Math.random() * config.sampleQuestions.length)];

  return (
    <div
      className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent cursor-pointer"
      onClick={onPlay}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative h-full bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-10 flex flex-col gap-8 shadow-2xl border border-white/5">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className={`p-5 rounded-2xl bg-gradient-to-br ${config.gradient} shadow-2xl ring-1 ring-white/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 shadow-lg">
              DAILY CHALLENGE
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors duration-500">
              {config.title}
            </h3>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 leading-relaxed line-clamp-2">
              {config.description}
            </p>
          </div>
        </div>

        {/* Sample Question Preview */}
        <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5 group-hover:bg-white/10 transition-all duration-500">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">SAMPLE CHALLENGE</p>
          <p className="text-sm font-bold text-foreground/90 leading-relaxed italic">&quot;{sampleQuestion}&quot;</p>
        </div>

        {/* Quiz Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-[2rem] border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-500">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">TIME</span>
            <span className="text-xs font-black uppercase tracking-widest text-foreground">1-2 MIN</span>
          </div>
          <div className="flex flex-col gap-1 p-4 bg-white/5 rounded-[2rem] border border-white/5 group-hover:bg-accent/5 group-hover:border-accent/20 transition-all duration-500">
            <Coins className="h-4 w-4 text-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">REWARD</span>
            <span className="text-xs font-black uppercase tracking-widest text-foreground">25 MAX</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }} 
          className={`w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs bg-gradient-to-r ${config.gradient} hover:shadow-2xl hover:shadow-primary/40 text-white border-0 transition-all duration-700 hover:scale-[1.02] active:scale-95 shadow-xl`}
        >
          START CHALLENGE
        </Button>
      </div>
    </div>
  );
}
