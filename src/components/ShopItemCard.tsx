'use client';

import { ShopItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Coins, CheckCircle2, Sparkles, RefreshCw, ShoppingCart, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopItemCardProps {
    item: ShopItem;
    owned: boolean;
    userCoins: number;
    onPurchase: (item: ShopItem) => void;
    purchasing: boolean;
}

export function ShopItemCard({ item, owned, userCoins, onPurchase, purchasing }: ShopItemCardProps) {
    const canAfford = userCoins >= item.price;
    const isOutOfStock = item.stock !== undefined && item.stock <= 0;

    const getCategoryConfig = (category: string) => {
        switch (category) {
            case 'booster': return {
                color: 'text-amber-500',
                bg: 'bg-amber-500/10',
                border: 'border-amber-500/20',
                gradient: 'from-amber-500/20 via-transparent to-amber-500/10'
            };
            case 'visual': return {
                color: 'text-violet-500',
                bg: 'bg-violet-500/10',
                border: 'border-violet-500/20',
                gradient: 'from-violet-500/20 via-transparent to-violet-500/10'
            };
            case 'profile': return {
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                gradient: 'from-blue-500/20 via-transparent to-blue-500/10'
            };
            default: return {
                color: 'text-primary',
                bg: 'bg-primary/10',
                border: 'border-primary/20',
                gradient: 'from-primary/20 via-transparent to-primary/10'
            };
        }
    };

    const config = getCategoryConfig(item.category);

    return (
        <div 
            className={cn(
                "group/card relative overflow-hidden rounded-[2rem] p-0.5 transition-all duration-700 hover:scale-[1.02]",
                owned 
                    ? "bg-gradient-to-br from-emerald-500 via-accent to-primary animate-gradient bg-[length:200%_auto] shadow-2xl shadow-emerald-500/20" 
                    : "bg-white/5 border border-white/10 shadow-2xl"
            )}
        >
            {/* Ambient Background Glow */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br transition-opacity duration-700 opacity-0 group-hover/card:opacity-100",
                owned ? "from-emerald-500/30 via-transparent to-primary/30" : config.gradient
            )} />
            
            <div className="relative h-full bg-card/40 backdrop-blur-3xl rounded-[1.9rem] p-6 md:p-8 flex flex-col items-center text-center">
                {/* Status Badges */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 items-end z-10">
                    {owned && (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 flex gap-2 items-center shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-700">
                            <CheckCircle2 className="h-3 w-3" />
                            OWNED
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-red-500 flex gap-2 items-center shadow-2xl backdrop-blur-xl">
                            OUT OF STOCK
                        </div>
                    )}
                </div>

                {item.stock !== undefined && item.stock < 5 && item.stock > 0 && !owned && (
                    <div className="absolute top-6 left-6 z-10">
                        <div className="animate-pulse px-3 py-1 rounded-full bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.2em] flex gap-2 items-center shadow-xl shadow-red-500/30">
                            <Sparkles className="h-3 w-3" />
                            ONLY {item.stock} LEFT
                        </div>
                    </div>
                )}

                {/* Item Icon Container */}
                <div className="relative mb-6 mt-4 group/icon">
                    <div className={cn(
                        "absolute inset-0 rounded-[1.5rem] blur-2xl transition-all duration-700 scale-125 opacity-0 group-hover/card:opacity-30",
                        owned ? "bg-emerald-500" : "bg-primary"
                    )} />
                    <div className={cn(
                        "relative w-24 h-24 rounded-[1.5rem] bg-gradient-to-br flex items-center justify-center transition-all duration-700 shadow-2xl",
                        owned 
                            ? "from-emerald-500/20 to-emerald-500/5 ring-1 ring-emerald-500/20" 
                            : "from-white/10 to-white/5 ring-1 ring-white/10 group-hover/card:scale-110 group-hover/card:rotate-6"
                    )}>
                        <div className="text-6xl transition-all duration-700 group-hover/card:scale-110 group-hover/card:drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] w-20 h-20 flex items-center justify-center">
                            {item.icon.startsWith('/') || item.icon.startsWith('http') ? (
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain drop-shadow-2xl" />
                            ) : (
                                item.icon
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3 mb-6 flex-1">
                    <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                            "px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-[0.3em] shadow-lg",
                            config.bg, config.color, config.border
                        )}>
                            {item.category}
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-foreground leading-tight group-hover/card:text-primary transition-colors duration-500">
                            {item.name}
                        </h3>
                    </div>
                    <p className="text-muted-foreground/60 text-[10px] font-black leading-relaxed line-clamp-2 uppercase tracking-[0.1em]">
                        {item.description}
                    </p>
                </div>

                {/* Metadata Grid */}
                {item.metadata && (
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {item.metadata.duration && (
                            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2 shadow-xl">
                                <RefreshCw className="h-3 w-3 text-primary animate-spin-slow" />
                                {item.metadata.duration} Uses
                            </div>
                        )}
                        {item.metadata.multiplier && (
                            <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[8px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2 shadow-xl">
                                <Sparkles className="h-3 w-3" />
                                {item.metadata.multiplier}x Multiplier
                            </div>
                        )}
                    </div>
                )}

                {/* Pricing & Action */}
                <div className="mt-auto w-full space-y-4">
                    <div className={cn(
                        "flex items-center justify-between py-4 px-6 rounded-[1.5rem] transition-all duration-500",
                        owned 
                            ? "bg-emerald-500/10 border border-emerald-500/20" 
                            : "bg-white/5 border border-white/10 shadow-inner"
                    )}>
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">Market Price</span>
                            <div className="flex items-center gap-2">
                                <Coins className={cn("h-4 w-4", owned ? "text-emerald-500" : "text-amber-500")} />
                                <span className={cn(
                                    "text-xl font-black tracking-tighter",
                                    owned ? "text-emerald-500" : canAfford ? "text-foreground" : "text-red-500"
                                )}>
                                    {item.price.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        {owned ? (
                            <div className="p-2 rounded-lg bg-emerald-500/20">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            </div>
                        ) : !canAfford && (
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Lock className="h-4 w-4 text-red-500/50" />
                            </div>
                        )}
                    </div>

                    <Button
                        onClick={() => onPurchase(item)}
                        disabled={owned || !canAfford || isOutOfStock || purchasing}
                        className={cn(
                            "w-full h-12 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all duration-700 shadow-xl",
                            owned 
                                ? "bg-white/5 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/5 cursor-default" 
                                : !canAfford 
                                    ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                                    : "bg-gradient-to-r from-primary to-accent text-white border-0 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-95"
                        )}
                    >
                        {owned ? (
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                COLLECTED
                            </div>
                        ) : isOutOfStock ? (
                            "TEMPORARILY SOLD OUT"
                        ) : !canAfford ? (
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                NEED {item.price - userCoins} MORE
                            </div>
                        ) : purchasing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                UNLOCK NOW
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
