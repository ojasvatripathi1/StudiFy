import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserData, ShopItem } from "@/lib/types";
import { Crown, Medal, Trophy, TrendingUp, Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { getShopItems } from "@/lib/shopFirebase";
import Image from "next/image";

type LeaderboardProps = {
  users: UserData[];
  currentUserId?: string;
};

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-6 w-6 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] animate-pulse" />;
  if (rank === 2) return <Trophy className="h-5 w-5 text-accent" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-primary/70" />;
  return <span className="w-5 text-center font-black text-muted-foreground">{rank}</span>;
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/20";
  if (rank === 2) return "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 text-white shadow-xl shadow-slate-400/20 ring-2 ring-slate-400/20";
  if (rank === 3) return "bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white shadow-xl shadow-orange-700/20 ring-2 ring-orange-700/20";
  return "bg-white/5 text-muted-foreground border border-white/10";
};

export function Leaderboard({ users, currentUserId }: LeaderboardProps) {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);

  useEffect(() => {
    const loadShopItems = async () => {
      const items = await getShopItems();
      setShopItems(items);
    };
    loadShopItems();
  }, []);

  const getUserFrame = (user: UserData) => {
    if (!user.activeCustomizations?.profileFrame) return null;
    return shopItems.find(item => item.id === user.activeCustomizations?.profileFrame) || null;
  };

  return (
    <div className="xl:col-span-2 group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.01] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative h-full bg-card/40 backdrop-blur-3xl rounded-[2.9rem] p-10 flex flex-col gap-10 shadow-2xl border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-primary/10 rounded-2xl border border-primary/20 shadow-xl">
              <Trophy className="h-8 w-8 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-700" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">GLOBAL COMPETITION</p>
              <h3 className="text-3xl font-black tracking-tight text-foreground uppercase">Hall of Fame</h3>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 py-3 px-6 rounded-2xl bg-white/5 border border-white/5 shadow-lg">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">TOP SCORE</span>
              <span className="text-sm font-black text-primary tracking-tighter">{users[0]?.coins.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/5 backdrop-blur-md">
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent bg-white/5">
                <TableHead className="w-16 sm:w-24 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground h-16 px-2 sm:px-8 text-center">RANK</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground h-16 px-2 sm:px-4">PLAYER</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground h-16 px-2 sm:px-8">EARNINGS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                const activeFrame = getUserFrame(user);
                const isGolden = activeFrame?.name?.includes('Golden');
                const isDiamond = activeFrame?.name?.includes('Diamond');

                return (
                  <TableRow 
                    key={`${user.uid}-${index}`} 
                    className={`group/row transition-all duration-500 hover:bg-white/5 border-white/5 ${
                      user.uid === currentUserId 
                        ? "bg-primary/10" 
                        : ""
                    }`}
                    style={{
                      ...(isGolden && {
                        background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.03), transparent)',
                      }),
                      ...(isDiamond && {
                        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.03), transparent)',
                      })
                    }}
                  >
                    <TableCell className="px-2 sm:px-8">
                      <div className="flex items-center justify-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${getRankBadge(index + 1)} transform group-hover/row:scale-110 transition-all duration-500 ${
                          isGolden ? 'ring-2 ring-yellow-400/50 shadow-[0_0_15px_rgba(255,215,0,0.3)]' :
                          isDiamond ? 'ring-2 ring-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]' : ''
                        }`}>
                          {getRankIcon(index + 1)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-2 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-4 py-2">
                        <div className="relative">
                          {/* Profile Frame Effect */}
                          <div className={`absolute -inset-[3px] rounded-2xl blur-[6px] opacity-40 transition-all duration-500 group-hover/row:opacity-70 ${
                            isGolden ? 'bg-yellow-400' :
                            isDiamond ? 'bg-cyan-400' : ''
                          }`}></div>
                          
                          <div className={`relative h-10 w-10 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center ring-2 transition-all duration-500 overflow-hidden shadow-2xl ${
                            isGolden ? 'ring-yellow-400 border-2 border-yellow-400/50 bg-yellow-400/20' :
                            isDiamond ? 'ring-cyan-400 border-2 border-cyan-400/50 bg-cyan-400/20' :
                            'ring-white/10 group-hover/row:ring-primary/40 bg-gradient-to-br from-primary/10 to-accent/10'
                          }`}>
                            {/* Shimmer for legendary frames */}
                            {(isGolden || isDiamond) && (
                              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]`}></div>
                              </div>
                            )}

                            {user.avatarUrl ? (
                              <Image 
                                src={user.avatarUrl} 
                                alt={user.displayName || 'User'} 
                                fill 
                                className="object-cover group-hover/row:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <span className="text-foreground font-black text-2xl select-none group-hover/row:scale-110 transition-transform duration-500">
                                {user.displayName?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          
                          {user.uid === currentUserId && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-card shadow-lg animate-pulse z-20" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 max-w-[150px] sm:max-w-none">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm sm:text-xl font-black tracking-tight uppercase transition-all duration-300 break-words leading-tight ${
                              user.uid === currentUserId ? 'text-primary' : 
                              isGolden ? 'text-yellow-600 dark:text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]' :
                              isDiamond ? 'text-cyan-600 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.3)]' :
                              'text-foreground/90'
                            }`}>
                              {user.displayName || user.username || 'Anonymous'}
                            </span>
                            {(isGolden || isDiamond) && (
                              <Badge className={`px-1.5 py-0 text-[8px] font-black tracking-tighter uppercase ${
                                isGolden ? 'bg-yellow-400/20 text-yellow-500 border-yellow-400/30' : 
                                'bg-cyan-400/20 text-cyan-500 border-cyan-400/30'
                              }`}>
                                {isGolden ? 'GOLDEN' : 'DIAMOND'}
                              </Badge>
                            )}
                          </div>
                          {user.uid === currentUserId ? (
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/70">CHAMPION STATUS</span>
                          ) : (isGolden || isDiamond) && (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                                isGolden ? 'text-yellow-500/70' : 'text-cyan-500/70'
                              }`}>
                                LEGENDARY PLAYER
                              </span>
                              <div className={`w-1 h-1 rounded-full ${isGolden ? 'bg-yellow-500/50' : 'bg-cyan-500/50'}`} />
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-2 sm:px-8">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-primary group-hover/row:rotate-12 transition-transform duration-500" />
                            <span className="text-sm sm:text-xl font-black text-foreground tracking-tighter">{user.coins.toLocaleString()}</span>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">COINS</span>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between px-4 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">LIVE STANDINGS • {users.length} PLAYERS ACTIVE</span>
          </div>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-all duration-500 hover:gap-3 flex items-center gap-2">
            VIEW ALL <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
