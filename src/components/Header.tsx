"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserData } from '@/lib/types';
import { signOut } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { LogOut, Coins, Crown, TrendingUp } from 'lucide-react';
import { StudiFyLogo } from './icons';
import { useEffect, useState } from 'react';
import { getShopItems } from '@/lib/shopFirebase';
import { ShopItem } from '@/lib/types';
import Image from 'next/image';
import { getCurrentAvatarPath, DEFAULT_AVATAR } from '@/lib/avatarUtils';

type HeaderProps = {
  user: UserData;
  onProfileClick?: () => void;
  onLogoClick?: () => void;
};

export function Header({ user, onProfileClick, onLogoClick }: HeaderProps) {
  const router = useRouter();
  const [activeTitle, setActiveTitle] = useState<ShopItem | null>(null);
  const [activeFrame, setActiveFrame] = useState<ShopItem | null>(null);

  useEffect(() => {
    const loadCustomizations = async () => {
      if (user.activeCustomizations) {
        const items = await getShopItems();
        if (user.activeCustomizations.title) {
          const titleItem = items.find(i => i.id === user.activeCustomizations?.title);
          setActiveTitle(titleItem || null);
        }
        if (user.activeCustomizations.profileFrame) {
          const frameItem = items.find(i => i.id === user.activeCustomizations?.profileFrame);
          setActiveFrame(frameItem || null);
        }
      }
    };
    loadCustomizations();
  }, [user.activeCustomizations]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 flex h-14 md:h-16 items-center gap-2 md:gap-4 border-b border-border/10 bg-background/80 backdrop-blur-xl px-4 md:px-8 z-50 transition-all duration-300">
      <nav className="flex items-center gap-4 md:gap-6">
        <Link 
          href="/" 
          onClick={(e) => {
            if (onLogoClick) {
              e.preventDefault();
              onLogoClick();
            }
          }}
          className="flex items-center gap-2 md:gap-2.5 group transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="relative p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors duration-300">
            <StudiFyLogo className="h-5 w-5 md:h-6 md:w-6 text-primary transition-transform duration-500 group-hover:rotate-12" />
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-black font-headline tracking-tight bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent leading-none">
              StudiFy
            </span>
            <span className="hidden xs:block text-[7px] md:text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
              Elevate Learning
            </span>
          </div>
        </Link>
      </nav>

      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        {/* Stats Display - Hide on very small screens */}
        {user.rank && (
          <div className="hidden lg:flex items-center gap-2.5 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-2 rounded-xl bg-secondary/80 px-3 py-1.5 text-xs font-bold border border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
              <span className="text-foreground/70 uppercase text-[9px] tracking-wider">Rank</span>
              <span className="text-foreground font-black">#{user.rank}</span>
            </div>
          </div>
        )}
        
        {/* Coin Balance */}
        <div className="flex items-center gap-1.5 md:gap-2 rounded-lg md:rounded-xl bg-primary/10 px-2 md:px-3 py-1 md:py-1.5 text-sm font-bold border border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 group">
          <div className="bg-primary/20 p-1 rounded-md group-hover:rotate-12 transition-transform duration-300">
            <Coins className="h-3 w-3 md:h-3.5 md:w-3.5 text-primary" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-foreground font-black text-xs md:text-sm">{user.coins.toLocaleString()}</span>
            <span className="hidden xs:block text-primary/70 text-[7px] md:text-[8px] uppercase tracking-tighter">Coins</span>
          </div>
        </div>
        
        <div className="h-5 w-[1px] bg-border/50 hidden sm:block"></div>

        {/* User Info */}
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => onProfileClick ? onProfileClick() : router.push('/profile')}
            className={`flex items-center gap-2 md:gap-2.5 rounded-lg md:rounded-xl bg-secondary/30 pl-1 pr-2 md:pl-1.5 md:pr-3 py-1 md:py-1 backdrop-blur-md border transition-all duration-300 hover:shadow-xl hover:bg-secondary/50 active:scale-95 group relative ${
              activeFrame?.name?.includes('Golden') ? 'border-yellow-400/80 shadow-yellow-400/30' :
              activeFrame?.name?.includes('Diamond') ? 'border-cyan-400/80 shadow-cyan-400/30' :
              'border-border/50 shadow-sm'
            }`}
            style={{
              ...(activeFrame?.name?.includes('Golden') && {
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 223, 0, 0.05))',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.15), inset 0 0 10px rgba(255, 215, 0, 0.1)'
              }),
              ...(activeFrame?.name?.includes('Diamond') && {
                background: 'linear-gradient(135deg, rgba(185, 242, 255, 0.15), rgba(135, 206, 250, 0.05))',
                boxShadow: '0 0 20px rgba(0, 255, 255, 0.15), inset 0 0 10px rgba(0, 255, 255, 0.1)'
              })
            }}
          >
            {/* Special Frame Effects */}
            {activeFrame?.name?.includes('Golden') && (
              <div className="absolute inset-0 rounded-lg md:rounded-xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </div>
            )}
            {activeFrame?.name?.includes('Diamond') && (
              <div className="absolute inset-0 rounded-lg md:rounded-xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
              </div>
            )}

            {/* Avatar Display */}
            <div className="relative h-6 w-6 md:h-8 md:w-8 shrink-0">
              <div className={`absolute -inset-[3px] rounded-full blur-[4px] opacity-40 ${
                activeFrame?.name?.includes('Golden') ? 'bg-yellow-400' :
                activeFrame?.name?.includes('Diamond') ? 'bg-cyan-400' : ''
              }`}></div>
              
              <div className={`relative h-full w-full rounded-full border-2 overflow-hidden transition-all duration-300 ${
                activeFrame?.name?.includes('Golden') ? 'border-yellow-400 ring-2 ring-yellow-400/30' :
                activeFrame?.name?.includes('Diamond') ? 'border-cyan-400 ring-2 ring-cyan-400/30' :
                'border-background ring-1 ring-primary/20'
              }`}>
                <Image 
                  src={getCurrentAvatarPath(user.avatarUrl) || DEFAULT_AVATAR} 
                  alt="User Avatar" 
                  fill 
                  sizes="(max-width: 768px) 32px, 24px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {user.rank === 1 && (
                <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground p-0.5 rounded-full shadow-lg border-2 border-background z-10 animate-bounce">
                  <Crown className="h-2.5 w-2.5" />
                </div>
              )}
            </div>

            <div className="hidden sm:flex flex-col items-start text-left leading-tight">
              <span className={`font-black text-xs md:text-sm tracking-tight transition-colors duration-300 ${
                activeFrame?.name?.includes('Golden') ? 'text-yellow-600 dark:text-yellow-400' :
                activeFrame?.name?.includes('Diamond') ? 'text-cyan-600 dark:text-cyan-400' :
                'text-foreground/90 group-hover:text-primary'
              }`}>
                {user.displayName}
              </span>
              {activeTitle ? (
                <span className={`text-[7px] md:text-[8px] font-bold uppercase tracking-widest ${
                  activeFrame?.name?.includes('Golden') ? 'text-yellow-500/80' :
                  activeFrame?.name?.includes('Diamond') ? 'text-cyan-500/80' :
                  'text-primary opacity-80'
                }`}>
                  {activeTitle.name.replace(/"/g, '')}
                </span>
              ) : (
                <span className="text-[7px] md:text-[8px] font-medium text-muted-foreground uppercase tracking-widest">Student</span>
              )}
            </div>
          </button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSignOut}
            className="h-7 w-7 md:h-8 md:w-8 rounded-lg md:rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group shadow-sm border border-transparent hover:border-destructive/20"
          >
            <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:scale-110 transition-transform duration-300" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
