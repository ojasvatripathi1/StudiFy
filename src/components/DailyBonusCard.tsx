import { Button } from "@/components/ui/button";
import { Gift, Flame, Sparkles, RefreshCw, Brain } from "lucide-react";
import { useState } from "react";
import { DailyPuzzleModal } from "./DailyPuzzleModal";

type DailyBonusCardProps = {
  onClaim: () => void;
  canClaim: boolean;
  loading: boolean;
  streak?: number;
};

export function DailyBonusCard({ onClaim, canClaim, loading, streak = 0 }: DailyBonusCardProps) {
  const [isPuzzleOpen, setIsPuzzleOpen] = useState(false);
  const bonusAmount = 100 + (streak * 5);
  
  return (
    <div className="group relative overflow-hidden rounded-[3rem] p-[1px] transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br from-accent/30 via-accent/10 to-transparent shadow-2xl">
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative h-full bg-card/60 backdrop-blur-3xl rounded-[2.9rem] p-10 flex flex-col gap-8 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div className="p-5 bg-accent/10 rounded-[1.5rem] border border-accent/20 shadow-xl ring-1 ring-accent/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
            <Gift className="h-8 w-8 text-accent" />
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-2">Daily Gift</p>
            <div className="flex items-baseline gap-3 justify-end">
              <span className="text-5xl font-black tracking-tighter text-foreground">
                {bonusAmount.toLocaleString()}
              </span>
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em] px-3 py-1 bg-accent/10 rounded-full border border-accent/20">
                Coins
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Current Streak</span>
              <div className="flex items-center gap-2">
                <Flame className={`h-4 w-4 transition-all duration-700 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-muted-foreground/40'}`} />
                <span className="text-xs font-black text-accent uppercase tracking-widest">{streak} Days</span>
              </div>
            </div>
            <div className="flex justify-between gap-2 p-1 bg-black/20 rounded-full border border-white/5 shadow-inner">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-700 ${
                    i < Math.min(streak, 7) 
                      ? 'bg-gradient-to-r from-accent to-primary shadow-[0_0_10px_rgba(var(--accent),0.4)]' 
                      : 'bg-white/5'
                  }`}
                />
              ))}
            </div>
          </div>

          <Button
            onClick={() => setIsPuzzleOpen(true)}
            disabled={!canClaim || loading}
            className={`w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-700 border-0 ${
              canClaim 
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-95' 
                : 'bg-white/5 text-muted-foreground/40 cursor-not-allowed border border-white/5'
            }`}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : canClaim ? (
              <div className="flex items-center gap-3">
                <Brain className="h-4 w-4 fill-current animate-pulse" />
                Play Puzzle to Claim
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-muted-foreground/40" />
                Claimed Today
              </div>
            )}
          </Button>
        </div>
      </div>

      <DailyPuzzleModal 
        isOpen={isPuzzleOpen}
        onClose={() => setIsPuzzleOpen(false)}
        onComplete={() => {
          setIsPuzzleOpen(false);
          onClaim();
        }}
      />

      {/* Animated Decorative Elements */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
    </div>
  );
}

