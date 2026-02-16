"use client";

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Sparkles } from "lucide-react";

type BalanceCardProps = {
  balance: number;
};

export function BalanceCard({ balance }: BalanceCardProps) {
  const [displayBalance, setDisplayBalance] = useState(0);

  useEffect(() => {
    const animationDuration = 1000; // 1 second
    const frameDuration = 1000 / 60; // 60 fps
    const totalFrames = Math.round(animationDuration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentBalance = Math.round(balance * progress);
      setDisplayBalance(currentBalance);

      if (frame === totalFrames) {
        clearInterval(counter);
        setDisplayBalance(balance);
      }
    }, frameDuration);

    return () => clearInterval(counter);
  }, [balance]);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] p-[1px] transition-all duration-700 hover:scale-[1.02] bg-gradient-to-br from-primary/30 via-primary/10 to-transparent shadow-2xl">
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative h-full bg-card/60 backdrop-blur-3xl rounded-[1.9rem] p-6 md:p-8 flex flex-col gap-6 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 shadow-xl ring-1 ring-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
            <Coins className="h-6 w-6 text-primary" />
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-1.5">Total Wealth</p>
            <div className="flex items-baseline gap-2 justify-end">
              <span className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
                {displayBalance.toLocaleString()}
              </span>
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                Coins
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">Tier Progress</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-2.5 w-2.5 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{Math.min(Math.round((displayBalance / 1000) * 100), 100)}%</span>
            </div>
          </div>
          
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-gradient rounded-full transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(var(--primary),0.4)]"
              style={{ width: `${Math.min((displayBalance / 1000) * 100, 100)}%` }}
            />
          </div>
          
          <div className="flex items-center justify-center gap-2.5 py-3 px-5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-700">
            <TrendingUp className="h-3.5 w-3.5 text-primary group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform duration-700" />
            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">
              {displayBalance >= 1000 ? 'Master Rank Reached' : `${1000 - displayBalance} COINS TO NEXT TIER`}
            </p>
          </div>
        </div>
      </div>

      {/* Animated Decorative Elements */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
    </div>
  );
}
