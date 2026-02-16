"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge, UserData } from '@/lib/types';
import { getBadges, purchaseBadge, getUserData, db } from '@/lib/firebase';
import { writeBatch, collection, doc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins, Award, Star, Zap, Crown, Trophy, Target, Gift, Lock, Loader2, ShoppingCart } from 'lucide-react';
import { sampleBadges } from '@/scripts/initializeTestData';

const iconMap = {
  coins: Coins,
  award: Award,
  star: Star,
  zap: Zap,
  crown: Crown,
  trophy: Trophy,
  target: Target
};

export function BadgeStore() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [badgeData, userDataResult] = await Promise.all([
          getBadges(),
          getUserData(user.uid)
        ]);
        
        // If no badges in Firestore, initialize with sample badges
        if (badgeData.length === 0) {
          console.log('Initializing badges in Firestore...');
          const batch = writeBatch(db);
          
          // Add sample badges to Firestore
          sampleBadges.forEach(badge => {
            const badgeRef = doc(collection(db, 'badges'), badge.id);
            batch.set(badgeRef, {
              id: badge.id, // Ensure ID is included in the document data
              name: badge.name,
              description: badge.description,
              price: badge.price || null,
              requirement: badge.requirement || null,
              icon: badge.icon,
              color: badge.color,
              createdAt: serverTimestamp()
            });
          });
          
          await batch.commit();
          console.log('Sample badges initialized in Firestore');
          
          // Refresh badges after initialization
          const updatedBadgeData = await getBadges();
          setBadges(updatedBadgeData.length > 0 ? updatedBadgeData : sampleBadges);
        } else {
          setBadges(badgeData);
        }
        
        setUserData(userDataResult);
      } catch (error) {
        console.error('Error initializing badges:', error);
        // Fallback to sample badges on error
        setBadges(sampleBadges);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handlePurchase = async (badgeId: string) => {
    if (!user || !userData) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase badges.",
        variant: "destructive",
      });
      return;
    }
    
    setPurchasing(badgeId);
    try {
      // Find the badge in the local state first
      const badgeToPurchase = badges.find(b => b.id === badgeId);
      if (!badgeToPurchase) {
        throw new Error('The selected badge could not be found. Please refresh the page and try again.');
      }
      
      // Check if user already owns the badge
      if (userData.badges?.includes(badgeId)) {
        throw new Error(`You already own the "${badgeToPurchase.name}" badge!`);
      }
      
      // Check if badge is purchasable
      if (!badgeToPurchase.price || badgeToPurchase.price <= 0) {
        throw new Error('This badge is not available for purchase.');
      }
      
      // Check if user has enough coins
      if (userData.coins < badgeToPurchase.price) {
        throw new Error(`You need ${badgeToPurchase.price - userData.coins} more coins to purchase this badge.`);
      }
      
      // Proceed with the purchase
      await purchaseBadge(user.uid, badgeId);
      
      // Refresh user data to get updated badges and coin balance
      const updatedUserData = await getUserData(user.uid);
      setUserData(updatedUserData);
      
      toast({
        title: "Badge Purchased!",
        description: `You've successfully purchased the "${badgeToPurchase.name}" badge for ${badgeToPurchase.price} coins.`,
      });
      
    } catch (error: unknown) {
      console.error('Purchase error:', error);
      
      // More specific error messages for common cases
      let errorMessage = "Failed to complete the purchase. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes('not found') || error.message.includes('Invalid badge ID')) {
          errorMessage = "The selected badge could not be found. Please try refreshing the page.";
        } else if (error.message.includes('already owned')) {
          errorMessage = `You already own this badge!`;
        } else if (error.message.includes('insufficient coins') || error.message.includes('not enough coins')) {
          errorMessage = `Insufficient coins to complete this purchase.`;
        }
      }
      
      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setPurchasing(null);
    }
  };

  const purchasableBadges = badges?.filter(badge => badge.price && badge.price > 0) || [];
  const achievementBadges = badges?.filter(badge => !badge.price && badge.requirement) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* User's Current Badges - More compact and premium */}
      <section className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/10 to-primary/30 opacity-40 blur-2xl group-hover:opacity-60 transition-opacity duration-700" />
        <div className="relative bg-card/60 backdrop-blur-3xl rounded-[2.9rem] border border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full w-fit">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Achievements</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">
                  Your <span className="text-primary">Collection</span>
                </h2>
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground max-w-lg">
                  ({userData?.badges?.length || 0}) Prestigious marks of your academic journey.
                </p>
              </div>
            </div>

            {userData?.badges?.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {userData.badges.map(badgeId => {
                  const badge = badges.find(b => b.id === badgeId);
                  if (!badge) return null;
                  
                  const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Award;
                  
                  return (
                    <div key={badgeId} className="group/item relative flex flex-col items-center text-center p-8 bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-white/10 hover:border-primary/40 transition-all duration-700 hover:scale-105 hover:rotate-3 hover:shadow-2xl hover:shadow-primary/20">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl scale-0 group-hover/item:scale-125 transition-transform duration-700" />
                        <IconComponent className="relative h-14 w-14 text-primary group-hover/item:scale-110 group-hover/item:rotate-12 transition-all duration-500" />
                      </div>
                      <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-foreground mb-2 line-clamp-1">{badge.name}</h4>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-tight opacity-60 group-hover/item:opacity-100 transition-opacity">{badge.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-black/20 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-white/10 group/empty">
                <div className="w-28 h-28 mx-auto mb-8 bg-primary/10 rounded-[2rem] flex items-center justify-center transition-transform duration-700 group-hover/empty:scale-110 group-hover/empty:rotate-12">
                  <Gift className="h-14 w-14 text-primary/40" />
                </div>
                <p className="text-foreground font-black uppercase tracking-[0.2em] text-xl mb-3">Start Your Collection!</p>
                <p className="text-muted-foreground max-w-xs mx-auto text-xs font-bold uppercase tracking-widest opacity-60">
                  Complete quizzes and maintain streaks to earn your first prestigious badge.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Badge Store - Modern Grid */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4 md:px-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-accent/10 border border-accent/20 rounded-full w-fit">
              <ShoppingCart className="h-4 w-4 text-accent" />
              <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Marketplace</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">
              Exclusive <span className="text-accent">Badges</span>
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground max-w-lg">
              Unlock unique icons and status symbols using your hard-earned coins!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {purchasableBadges.map(badge => {
            const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Award;
            const isOwned = userData?.badges?.includes(badge.id) || false;
            const canAfford = userData && userData.coins >= (badge.price || 0);
            
            return (
              <div 
                key={badge.id} 
                className={`group/card relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.02] hover:-rotate-1 ${
                  isOwned 
                    ? 'bg-gradient-to-br from-primary/40 via-primary/10 to-transparent' 
                    : 'bg-gradient-to-br from-white/10 to-white/5 shadow-2xl'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 blur-xl" />
                
                <div className="relative h-full bg-card/80 backdrop-blur-3xl rounded-[2.9rem] p-10 flex flex-col items-center text-center border border-white/10">
                  <div className="relative mb-10">
                    <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 scale-150 opacity-20 ${
                      isOwned ? 'bg-primary' : 'bg-primary/50 group-hover/card:opacity-40'
                    }`} />
                    <div className={`relative p-8 rounded-[2rem] bg-gradient-to-br transition-all duration-700 ${
                      isOwned ? 'from-primary/20 to-primary/10 ring-2 ring-primary/30' : 'from-primary/10 to-transparent group-hover/card:scale-110 group-hover/card:rotate-6'
                    }`}>
                      <IconComponent className={`h-20 w-20 transition-all duration-700 ${
                        isOwned ? 'text-primary' : 'text-primary/70 group-hover/card:text-primary'
                      }`} />
                    </div>
                    {isOwned && (
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl border-4 border-card animate-bounce">
                        <Award className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight mb-3 text-foreground">{badge.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-10 leading-relaxed line-clamp-2 opacity-80 group-hover/card:opacity-100 transition-opacity">
                    {badge.description}
                  </p>

                  <div className="mt-auto w-full space-y-6">
                    <div className="flex items-center justify-center gap-3 py-4 px-8 rounded-[1.5rem] bg-black/20 border border-white/10">
                      <Coins className="h-6 w-6 text-amber-500" />
                      <span className={`text-2xl font-black tracking-tighter ${
                        isOwned ? 'text-muted-foreground/50' : canAfford ? 'text-amber-500' : 'text-destructive'
                      }`}>
                        {badge.price?.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      onClick={() => handlePurchase(badge.id)}
                      disabled={isOwned || purchasing === badge.id || !canAfford}
                      className={`w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 group/btn overflow-hidden relative ${
                        isOwned 
                          ? 'bg-white/5 text-muted-foreground/50 border border-white/10' 
                          : !canAfford 
                            ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                            : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-2xl shadow-primary/30 hover:shadow-primary/50 active:scale-95'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
                      {purchasing === badge.id ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Buying...
                        </div>
                      ) : isOwned ? (
                        "Already Owned"
                      ) : !canAfford ? (
                        `Insufficient Coins`
                      ) : (
                        "Purchase Badge"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Achievement Badges - Prestigious Style */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4 md:px-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full w-fit">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Mastery</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase">
              Mastery <span className="text-primary">Rewards</span>
            </h2>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground max-w-lg">
              Earn these rare badges through skill and persistence.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {achievementBadges.map(badge => {
            const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Award;
            const isOwned = userData?.badges?.includes(badge.id) || false;
            
            return (
              <div 
                key={badge.id} 
                className={`group/card relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.02] ${
                  isOwned 
                    ? 'bg-gradient-to-br from-primary/40 to-accent/40 shadow-2xl shadow-primary/20' 
                    : 'bg-white/5 border border-white/10 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
                }`}
              >
                <div className="relative h-full bg-card/90 backdrop-blur-3xl rounded-[2.9rem] p-10 flex flex-col items-center text-center border border-white/10">
                  <div className="relative mb-10">
                    {isOwned && (
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-3xl animate-pulse scale-150" />
                    )}
                    <div className={`relative p-8 rounded-[2rem] transition-all duration-700 ${
                      isOwned ? 'bg-primary/20 text-primary ring-2 ring-primary/30' : 'bg-white/5 text-muted-foreground/50'
                    }`}>
                      <IconComponent className={`h-20 w-20 ${isOwned ? 'animate-bounce' : ''}`} />
                    </div>
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tight mb-3">{badge.name}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-8 leading-relaxed opacity-80 group-hover/card:opacity-100 transition-opacity">
                    {badge.description}
                  </p>

                  <div className="mt-auto w-full">
                    <div className={`py-4 px-8 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] border flex items-center justify-center gap-3 transition-all duration-500 ${
                      isOwned 
                        ? 'bg-primary/10 border-primary/30 text-primary shadow-xl shadow-primary/10' 
                        : 'bg-black/20 border-white/10 text-muted-foreground/50'
                    }`}>
                      {isOwned ? (
                        <>
                          <Award className="h-4 w-4" />
                          Earned Achievement
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 opacity-50" />
                          {badge.requirement?.type === 'streak' && `Reach ${badge.requirement.value} Day Streak`}
                          {badge.requirement?.type === 'perfect' && `Get ${badge.requirement.value} Perfect Scores`}
                          {badge.requirement?.type === 'coins' && `Earn ${badge.requirement.value} Total Coins`}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
