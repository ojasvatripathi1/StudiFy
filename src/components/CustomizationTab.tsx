'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ShopItem, UserData } from '@/lib/types';
import { getUserPurchases, activateCustomization, deactivateCustomization, getShopItems } from '@/lib/shopFirebase';
import { getUserData } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Palette, Crown, Check, ShieldCheck, RefreshCw, Zap, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomizationTab() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [purchasedItems, setPurchasedItems] = useState<(ShopItem & { purchaseId: string })[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState<string | null>(null);

    const loadCustomizationData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [purchases, allShopItems, userInfo] = await Promise.all([
                getUserPurchases(user.uid),
                getShopItems(),
                getUserData(user.uid)
            ]);

            // Map purchases to objects containing both the purchase ID and the full ShopItem data
            const items = purchases
                .map(p => {
                    const shopItem = allShopItems.find(i => i.id === p.itemId);
                    return shopItem ? { ...shopItem, purchaseId: p.id } : null;
                })
                .filter((i): i is (ShopItem & { purchaseId: string }) => !!i);

            setPurchasedItems(items);
            setUserData(userInfo);
        } catch (error) {
            console.error('Error loading customizations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load your items.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (user) {
            loadCustomizationData();
        }
    }, [user, loadCustomizationData]);

    const handleActivate = async (item: ShopItem) => {
        if (!user) return;
        setActivating(item.id);
        try {
            let type: 'theme' | 'avatar' | 'title' | 'profileFrame' = 'theme';
            if (item.category === 'visual') type = 'theme';
            if (item.category === 'profile') {
                if (item.name.toLowerCase().includes('title')) type = 'title';
                else if (item.name.toLowerCase().includes('frame')) type = 'profileFrame';
            }

            // Check if already active - if so, deactivate
            const isActive = userData?.activeCustomizations?.[type] === item.id;
            
            if (isActive) {
                const success = await deactivateCustomization(user.uid, type);
                if (success) {
                    toast({
                        title: 'Customization Removed',
                        description: `${item.name} has been deactivated.`,
                    });
                    await loadCustomizationData();
                } else {
                    throw new Error('Failed to deactivate');
                }
            } else {
                const success = await activateCustomization(user.uid, item.id, type);
                if (success) {
                    toast({
                        title: 'Customization Applied! ✨',
                        description: `${item.name} is now active.`,
                    });
                    await loadCustomizationData();
                } else {
                    throw new Error('Failed to activate');
                }
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to update customization.',
                variant: 'destructive'
            });
        } finally {
            setActivating(null);
        }
    };

    const themes = purchasedItems.filter(i => i.category === 'visual');
    const profileItems = purchasedItems.filter(i => i.category === 'profile');
    const boosterItems = purchasedItems.filter(i => i.category === 'booster');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                    <RefreshCw className="h-12 w-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                    Synchronizing Collection...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-16 pb-12">
            {/* Themes Section */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative group overflow-hidden rounded-[3rem] p-1 mb-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/30 via-transparent to-violet-500/30 opacity-50 blur-3xl animate-pulse" />
                    <div className="relative bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-10 border border-white/10 flex items-center justify-between gap-8 shadow-2xl">
                        <div className="flex items-center gap-8">
                            <div className="p-6 rounded-[2rem] bg-violet-500/10 text-violet-500 ring-1 ring-violet-500/20 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                <Palette className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-violet-500/60">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Aesthetics</span>
                                </div>
                                <h3 className="text-4xl font-black uppercase tracking-tight text-foreground">Visual Themes</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {themes.length === 0 ? (
                    <EmptyState 
                        message="Your aesthetic collection is empty. Discover premium themes in the Shop."
                        icon={<Palette className="h-12 w-12" />}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 md:px-0">
                        {themes.map(theme => (
                            <CustomizationCard
                                key={theme.purchaseId}
                                item={theme}
                                isActive={userData?.activeCustomizations?.theme === theme.id}
                                onActivate={() => handleActivate(theme)}
                                loading={activating === theme.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Profile Section */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                <div className="relative group overflow-hidden rounded-[3rem] p-1 mb-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-transparent to-amber-500/30 opacity-50 blur-3xl animate-pulse" />
                    <div className="relative bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-10 border border-white/10 flex items-center justify-between gap-8 shadow-2xl">
                        <div className="flex items-center gap-8">
                            <div className="p-6 rounded-[2rem] bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                <Crown className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-amber-500/60">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identity</span>
                                </div>
                                <h3 className="text-4xl font-black uppercase tracking-tight text-foreground">Profile Upgrades</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {profileItems.length === 0 ? (
                    <EmptyState 
                        message="No identity upgrades found. Earn titles and frames through achievements."
                        icon={<Crown className="h-12 w-12" />}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 md:px-0">
                        {profileItems.map(item => (
                            <CustomizationCard
                                key={item.purchaseId}
                                item={item}
                                isActive={
                                    userData?.activeCustomizations?.title === item.id ||
                                    userData?.activeCustomizations?.profileFrame === item.id
                                }
                                onActivate={() => handleActivate(item)}
                                loading={activating === item.id}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Boosters Section */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                <div className="relative group overflow-hidden rounded-[3rem] p-1 mb-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-transparent to-emerald-500/30 opacity-50 blur-3xl animate-pulse" />
                    <div className="relative bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-10 border border-white/10 flex items-center justify-between gap-8 shadow-2xl">
                        <div className="flex items-center gap-8">
                            <div className="p-6 rounded-[2rem] bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                <Zap className="h-10 w-10" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-emerald-500/60">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Performance</span>
                                </div>
                                <h3 className="text-4xl font-black uppercase tracking-tight text-foreground">Active Boosters</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {boosterItems.length === 0 ? (
                    <EmptyState 
                        message="No active power-ups. Visit the Shop for multipliers and hint packs."
                        icon={<Zap className="h-12 w-12" />}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 md:px-0">
                        {boosterItems.map(item => (
                            <StaticCard 
                                key={item.purchaseId}
                                item={item}
                                footer="Boosters are automatically applied during study sessions and quizzes."
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

function CustomizationCard({ item, isActive, onActivate, loading }: {
    item: ShopItem;
    isActive: boolean;
    onActivate: () => void;
    loading: boolean;
}) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.02]",
            isActive ? "bg-gradient-to-br from-primary via-accent to-primary animate-gradient bg-[length:200%_auto] shadow-2xl" : "bg-white/5 border border-white/10"
        )}>
            {/* Background Glow */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-br transition-opacity duration-700",
                isActive ? "opacity-30" : "from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100"
            )} />

            <div className="relative h-full bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-10 flex flex-col gap-10">
                <div className="flex items-start justify-between gap-4">
                    <div className={cn(
                        "w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6",
                        isActive ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5 ring-1 ring-white/5"
                    )}>
                        {item.icon}
                    </div>
                    {isActive && (
                        <div className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white flex gap-3 items-center shadow-2xl backdrop-blur-xl">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            ACTIVE
                        </div>
                    )}
                </div>

                <div className="space-y-4 flex-1">
                    <h4 className="text-2xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors duration-500">
                        {item.name}
                    </h4>
                    <p className="text-xs font-black text-muted-foreground/60 leading-relaxed line-clamp-2 uppercase tracking-[0.1em]">
                        {item.description}
                    </p>
                </div>

                <Button
                    onClick={onActivate}
                    disabled={loading}
                    className={cn(
                        "w-full h-16 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-700 shadow-xl",
                        isActive 
                            ? "bg-white/5 hover:bg-white/10 text-white border border-white/10" 
                            : "bg-gradient-to-r from-primary to-accent text-white border-0 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-95"
                    )}
                >
                    {loading ? (
                        <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : isActive ? (
                        <div className="flex items-center gap-3">
                            <Check className="h-4 w-4" />
                            DEACTIVATE
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-4 w-4" />
                            APPLY NOW
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}

function StaticCard({ item, footer }: { item: ShopItem; footer: string }) {
    return (
        <div className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.02] bg-white/5 border border-white/10">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative h-full bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-10 flex flex-col gap-10 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-white/5 ring-1 ring-white/5 flex items-center justify-center text-5xl shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:-rotate-6">
                        {item.icon}
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    <h4 className="text-2xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors duration-500">
                        {item.name}
                    </h4>
                    <p className="text-xs font-black text-muted-foreground/60 leading-relaxed uppercase tracking-[0.1em]">
                        {item.description}
                    </p>
                </div>

                <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] leading-relaxed flex items-start gap-4 italic">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {footer}
                    </p>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
    return (
        <div className="relative group overflow-hidden rounded-[3rem] p-1 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-50" />
            <div className="relative bg-card/20 backdrop-blur-3xl rounded-[2.9rem] p-16 border-2 border-dashed border-white/10 flex flex-col items-center text-center gap-8">
                <div className="p-6 rounded-[2rem] bg-secondary/30 text-muted-foreground/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl ring-1 ring-white/5">
                    {icon}
                </div>
                <p className="max-w-[300px] text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/40 leading-loose">
                    {message}
                </p>
            </div>
        </div>
    );
}

