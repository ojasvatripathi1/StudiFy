'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ShopItem, UserData } from '@/lib/types';
import { getShopItems, getUserInventory, purchaseItem } from '@/lib/shopFirebase';
import { getUserData } from '@/lib/firebase';
import { initializeShopItems } from '@/lib/initializeShop';
import { ShopItemCard } from './ShopItemCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Store,
    Zap,
    Palette,
    Crown,
    Coins,
    RefreshCw,
    ShoppingBag,
    ShoppingCart,
    Sparkles,
    User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface ShopTabProps {
    userData?: UserData;
    onPurchaseComplete?: () => void;
}

export default function ShopTab({ userData: initialUserData, onPurchaseComplete }: ShopTabProps) {
    const { user } = useAuth();
    const { toast } = useToast();

    const [shopItems, setShopItems] = useState<ShopItem[]>([]);
    const [userInventory, setUserInventory] = useState<string[]>([]);
    const [userData, setUserData] = useState<UserData | null>(initialUserData || null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [confirmPurchase, setConfirmPurchase] = useState<{ item: ShopItem; show: boolean } | null>(null);
    const [isInitialising, setIsInitialising] = useState(false);
    const [avatarCategory, setAvatarCategory] = useState<'male' | 'female'>('male');

    const loadShopData = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [items, inventory, userInfo] = await Promise.all([
                getShopItems(),
                getUserInventory(user.uid),
                getUserData(user.uid)
            ]);

            setShopItems(items);
            setUserInventory(inventory);
            if (userInfo) setUserData(userInfo);
        } catch (error) {
            console.error('Error loading shop data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load shop items. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (user) {
            loadShopData();
        }
    }, [user, loadShopData]);

    const handlePurchaseClick = (item: ShopItem) => {
        setConfirmPurchase({ item, show: true });
    };

    const handleConfirmPurchase = async () => {
        if (!user || !confirmPurchase) return;

        setPurchasing(true);
        try {
            const result = await purchaseItem(user.uid, confirmPurchase.item.id);

            if (result.success) {
                toast({
                    title: 'Purchase Successful! 🎉',
                    description: result.message,
                });

                // Reload data
                await loadShopData();
                onPurchaseComplete?.();
            } else {
                toast({
                    title: 'Purchase Failed',
                    description: result.message,
                    variant: 'destructive'
                });
            }
        } catch {
            toast({
                title: 'Error',
                description: 'An error occurred during purchase.',
                variant: 'destructive'
            });
        } finally {
            setPurchasing(false);
            setConfirmPurchase(null);
        }
    };

    const handleInitializeShop = async () => {
        setIsInitialising(true);
        try {
            const result = await initializeShopItems();
            if (result.success) {
                toast({
                    title: 'Shop Initialized! 🏪',
                    description: `Successfully added ${result.count} items to the shop.`,
                });
                await loadShopData();
            } else {
                throw new Error('Failed to initialize');
            }
        } catch {
            toast({
                title: 'Initialization Failed',
                description: 'Could not populate shop items. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsInitialising(false);
        }
    };

    const filteredItems = selectedCategory === 'all'
        ? shopItems
        : shopItems.filter(item => {
            if (selectedCategory === 'avatar') {
                return item.category === 'avatar' && item.metadata?.gender === avatarCategory;
            }
            return item.category === selectedCategory;
        });

    const stats = {
        totalItems: shopItems.length,
        ownedItems: userInventory.length,
        availableCategories: [...new Set(shopItems.map(i => i.category))].length,
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Loading shop...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Shop Hero Section - Premium Overhaul */}
            <section className="relative group overflow-hidden rounded-[3rem] p-1">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 opacity-50 blur-2xl" />
                <div className="relative bg-card/50 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-12 border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div className="flex items-center gap-3 text-primary">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Store className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">StudiFy Market</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground leading-tight">
                            Upgrade Your <span className="text-primary">Journey</span>
                        </h2>
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 leading-relaxed max-w-lg">
                            Unlock exclusive boosters and premium themes to accelerate your learning experience. 🚀
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full lg:w-auto">
                        <div className="group/stat bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-700 hover:scale-105 hover:bg-white/10">
                            <div className="bg-amber-500/10 p-5 rounded-[1.5rem] mb-6 group-hover/stat:scale-110 group-hover/stat:rotate-6 transition-all duration-700 shadow-lg ring-1 ring-amber-500/20">
                                <Coins className="h-10 w-10 text-amber-500" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-3">Your Balance</span>
                            <span className="text-5xl font-black text-amber-500 tracking-tighter drop-shadow-2xl">
                                {userData?.coins?.toLocaleString() || 0}
                            </span>
                        </div>
                        <div className="group/stat bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-700 hover:scale-105 hover:bg-white/10">
                            <div className="bg-emerald-500/10 p-5 rounded-[1.5rem] mb-6 group-hover/stat:scale-110 group-hover/stat:rotate-6 transition-all duration-700 shadow-lg ring-1 ring-emerald-500/20">
                                <ShoppingBag className="h-10 w-10 text-emerald-500" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-3">Items Owned</span>
                            <span className="text-5xl font-black text-foreground tracking-tighter drop-shadow-2xl">
                                {stats.ownedItems}<span className="text-2xl text-muted-foreground/30">/{stats.totalItems}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Shop Content with Navigation */}
            <div className="space-y-12">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 px-4 md:px-0 mb-16">
                        <div className="space-y-6 w-full md:w-auto">
                            <TabsList className="h-auto p-3 bg-card/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl flex flex-wrap gap-3 w-full md:w-fit ring-1 ring-white/5">
                                {[
                                    { id: 'all', label: 'All Store', icon: Store },
                                    { id: 'booster', label: 'Boosters', icon: Zap },
                                    { id: 'visual', label: 'Visuals', icon: Palette },
                                    { id: 'profile', label: 'Profile', icon: Crown },
                                    { id: 'avatar', label: 'Avatars', icon: User },
                                ].map((cat) => (
                                    <TabsTrigger 
                                        key={cat.id} 
                                        value={cat.id} 
                                        className="px-10 py-5 rounded-[2.2rem] font-black text-[10px] uppercase tracking-[0.25em] transition-all duration-700 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-primary/40 flex items-center gap-4 group/tab"
                                    >
                                        <cat.icon className="h-4 w-4 transition-transform duration-700 group-data-[state=active]/tab:scale-125 group-data-[state=active]/tab:rotate-12" />
                                        {cat.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/* Gender Toggle for Avatars */}
                            {selectedCategory === 'avatar' && (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 flex justify-center md:justify-start">
                                    <div className="p-1.5 bg-card/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-xl inline-flex gap-1 ring-1 ring-white/5">
                                        <button
                                            onClick={() => setAvatarCategory('male')}
                                            className={cn(
                                                "px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2",
                                                avatarCategory === 'male' 
                                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105" 
                                                    : "text-muted-foreground hover:bg-white/5"
                                            )}
                                        >
                                            <User className="h-3 w-3" />
                                            Male
                                        </button>
                                        <button
                                            onClick={() => setAvatarCategory('female')}
                                            className={cn(
                                                "px-8 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2",
                                                avatarCategory === 'female' 
                                                    ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30 scale-105" 
                                                    : "text-muted-foreground hover:bg-white/5"
                                            )}
                                        >
                                            <User className="h-3 w-3" />
                                            Female
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4 px-8 py-4 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 text-muted-foreground/60 font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl ring-1 ring-white/5 self-start md:self-center">
                            <div className="relative">
                                <RefreshCw className="h-4 w-4 animate-spin-slow text-primary" />
                                <div className="absolute inset-0 bg-primary/20 blur-lg animate-pulse" />
                            </div>
                            <span>Market Refreshes Daily</span>
                        </div>
                    </div>

                    <TabsContent value={selectedCategory} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-card/20 backdrop-blur-3xl rounded-[4rem] border-2 border-dashed border-white/5 text-center space-y-8">
                                <div className="p-10 bg-secondary/30 rounded-[2.5rem] shadow-2xl ring-1 ring-white/5">
                                    <Store className="h-16 w-16 text-muted-foreground/20" />
                                </div>
                                <div className="space-y-3 px-6">
                                    <h3 className="text-2xl font-black uppercase tracking-tight">
                                        {shopItems.length === 0 ? "Shop is Empty" : "Nothing Here Yet"}
                                    </h3>
                                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40 max-w-md mx-auto">
                                        {shopItems.length === 0 
                                            ? "The market hasn't been initialized yet. Click below to stock the shelves with premium items!" 
                                            : "This category is currently being restocked. Check back soon!"}
                                    </p>
                                </div>
                                {shopItems.length === 0 && (
                                    <Button 
                                        onClick={handleInitializeShop}
                                        disabled={isInitialising}
                                        className="h-14 px-10 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-105 transition-all duration-500"
                                    >
                                        {isInitialising ? (
                                            <>
                                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                                Initializing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Initialize Shop Items
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {filteredItems.map((item) => (
                                    <ShopItemCard
                                        key={item.id}
                                        item={item}
                                        owned={userInventory.includes(item.id)}
                                        userCoins={userData?.coins || 0}
                                        onPurchase={handlePurchaseClick}
                                        purchasing={purchasing}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>


            </div>

            {/* Purchase Confirmation Dialog - Premium Redesign */}
            <Dialog open={confirmPurchase?.show || false} onOpenChange={(open) => !open && setConfirmPurchase(null)}>
                <DialogContent className="max-w-[550px] w-[95vw] md:w-full rounded-[2.5rem] md:rounded-[4rem] border-0 p-0 overflow-y-auto max-h-[90vh] bg-transparent shadow-none">
                    <div className="relative p-1 bg-gradient-to-br from-primary via-accent to-primary animate-gradient bg-[length:200%_auto] rounded-[4rem]">
                        <div className="relative bg-card/60 backdrop-blur-3xl rounded-[3.9rem] overflow-hidden">
                            <DialogHeader className="p-12 pb-6 text-center">
                                <div className="flex justify-center mb-8">
                                    <div className="p-5 rounded-[1.5rem] bg-primary/10 text-primary ring-1 ring-primary/20 shadow-2xl animate-bounce">
                                        <ShoppingCart className="h-10 w-10" />
                                    </div>
                                </div>
                                <DialogTitle className="text-4xl font-black uppercase tracking-tight text-foreground">Confirm Purchase</DialogTitle>
                                <DialogDescription className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 pt-4">
                                    Ready to unlock this premium item?
                                </DialogDescription>
                            </DialogHeader>

                            {confirmPurchase && (
                                <div className="px-12 pb-12 space-y-10">
                                    <div className="flex flex-col items-center text-center space-y-8 p-10 rounded-[3rem] bg-white/5 border border-white/10 shadow-inner relative group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        <div className="relative text-9xl p-10 bg-card/40 rounded-[2.5rem] shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ring-1 ring-white/10">
                                            {confirmPurchase.item.icon}
                                        </div>
                                        <div className="relative space-y-3">
                                            <h4 className="text-3xl font-black uppercase tracking-tight text-foreground">{confirmPurchase.item.name}</h4>
                                            <p className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground/40 leading-relaxed max-w-[280px]">
                                                {confirmPurchase.item.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white/5 border border-white/10 shadow-xl">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Total Cost</span>
                                            <div className="flex items-center gap-3">
                                                <Coins className="h-6 w-6 text-amber-500" />
                                                <span className="text-3xl font-black tracking-tighter text-foreground">
                                                    {confirmPurchase.item.price.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Remaining</span>
                                            <div className="flex items-center gap-3 justify-end">
                                                <span className="text-xl font-black tracking-tighter text-emerald-500">
                                                    {((userData?.coins || 0) - confirmPurchase.item.price).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <DialogFooter className="flex flex-col sm:flex-row gap-4">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setConfirmPurchase(null)}
                                            className="flex-1 h-16 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-500"
                                        >
                                            CANCEL
                                        </Button>
                                        <Button
                                            onClick={handleConfirmPurchase}
                                            disabled={purchasing}
                                            className="flex-[2] h-16 rounded-[1.8rem] bg-gradient-to-r from-primary to-accent text-white font-black uppercase tracking-[0.2em] text-[10px] border-0 shadow-xl hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-500"
                                        >
                                            {purchasing ? (
                                                <RefreshCw className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Sparkles className="h-4 w-4" />
                                                    CONFIRM & UNLOCK
                                                </div>
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
