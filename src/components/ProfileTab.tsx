"use client";

import { useEffect, useState } from "react";
import { UserData } from "@/lib/types";
import { updateUserProfile, getUserData } from "@/lib/firebase";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  AtSign, 
  Save, 
  Loader2, 
  Image as ImageIcon, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Coins, 
  Trophy, 
  Crown,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getShopItems } from "@/lib/shopFirebase";
import { ShopItem } from "@/lib/types";

interface ProfileTabProps {
  user: UserData;
  onUpdate: (updatedData: UserData) => void;
}

import { 
  AVATARS, 
  MALE_AVATARS, 
  FEMALE_AVATARS, 
  getCurrentAvatarPath 
} from "@/lib/avatarUtils";

export default function ProfileTab({ user, onUpdate }: ProfileTabProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [username, setUsername] = useState((user.username as string) || "");
  const [bio, setBio] = useState((user.bio as string) || "");
  
  // Initialize with migrated path if necessary
  const [avatarUrl, setAvatarUrl] = useState(() => getCurrentAvatarPath(user.avatarUrl));
  
  const [saving, setSaving] = useState(false);
  const [activeFrame, setActiveFrame] = useState<ShopItem | null>(null);
  const [avatarCategory, setAvatarCategory] = useState<'male' | 'female'>(() => {
    const currentPath = getCurrentAvatarPath(user.avatarUrl);
    if (currentPath && FEMALE_AVATARS.includes(currentPath)) {
      return 'female';
    }
    return 'male';
  });

  const isFirstTimeSetup = !user.username;

  // Load customizations
  useEffect(() => {
    const loadCustomizations = async () => {
      if (user.activeCustomizations?.profileFrame) {
        const items = await getShopItems();
        const frameItem = items.find(i => i.id === user.activeCustomizations?.profileFrame);
        setActiveFrame(frameItem || null);
      } else {
        setActiveFrame(null);
      }
    };
    loadCustomizations();
  }, [user.activeCustomizations]);

  // Keep local state in sync with prop updates
  useEffect(() => {
    setDisplayName(user.displayName || "");
    setUsername((user.username as string) || "");
    setBio((user.bio as string) || "");
    
    const currentPath = getCurrentAvatarPath(user.avatarUrl);
    setAvatarUrl(currentPath || AVATARS[0]);
    
    if (currentPath && FEMALE_AVATARS.includes(currentPath)) {
      setAvatarCategory('female');
    } else if (currentPath && MALE_AVATARS.includes(currentPath)) {
      setAvatarCategory('male');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();

    if (trimmedDisplayName.length < 3) {
      toast({
        title: "Invalid display name",
        description: "Display name must be at least 3 characters.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-z0-9_\.]{3,20}$/.test(trimmedUsername)) {
      toast({
        title: "Invalid username",
        description:
          "Username must be 3-20 characters and can contain lowercase letters, numbers, underscores and dots.",
        variant: "destructive",
      });
      return;
    }

    // 1. Optimistically update local UI state immediately (Header, etc.)
    const originalUser = { ...user };
    const updatedUser: UserData = {
      ...user,
      displayName: trimmedDisplayName,
      username: trimmedUsername,
      bio,
      avatarUrl,
    };
    onUpdate(updatedUser);

    setSaving(true);
    try {
      // 2. Update Firestore in the background
      await updateUserProfile(user.uid, {
        displayName: trimmedDisplayName,
        username: trimmedUsername,
        bio,
        avatarUrl,
      });
      
      toast({
        title: isFirstTimeSetup ? "Setup Complete! 🚀" : "Profile updated ✨",
        description: isFirstTimeSetup 
          ? "Welcome to StudiFy! Your profile is ready." 
          : "Your identity has been successfully synchronized.",
      });

    } catch (e: unknown) {
      console.error("Failed to update profile:", e);
      // Rollback on error
      onUpdate(originalUser);
      const errorMessage = e instanceof Error ? e.message : "Could not save your profile. Please try again.";
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Page Header */}
      <div className="relative group overflow-hidden rounded-[3rem] p-1">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 opacity-50 blur-2xl" />
        <div className="relative bg-card/50 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-12 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Personalization</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
              User Profile
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground max-w-md">
              Manage your digital identity and customize your presence on StudiFy.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2 justify-end">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-black uppercase tracking-tight text-foreground">Verified Student</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-4 space-y-10">
          <div className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.02] hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/20 to-primary/40 opacity-30 blur-xl group-hover:opacity-50 transition-opacity duration-700" />
            <div className="relative bg-card/80 backdrop-blur-3xl rounded-[2.9rem] overflow-hidden border border-white/10 shadow-2xl">
              <div className="h-40 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 animate-gradient-xy" />
              <div className="relative px-8 pb-10 flex flex-col items-center text-center">
                <div className="relative -mt-20 mb-8 group/avatar">
                  <div className={`absolute inset-0 blur-3xl opacity-20 group-hover/avatar:opacity-50 transition-opacity duration-700 ${
                    activeFrame?.name?.includes('Golden') ? 'bg-yellow-400' :
                    activeFrame?.name?.includes('Diamond') ? 'bg-cyan-400' : 'bg-primary'
                  }`} />
                  
                  <div className={cn(
                    "h-44 w-44 rounded-[3.5rem] bg-card border-[10px] shadow-2xl overflow-hidden relative transition-transform duration-700 group-hover/avatar:scale-105 group-hover/avatar:rotate-3",
                    activeFrame?.name?.includes('Golden') ? 'border-yellow-400 ring-4 ring-yellow-400/20' :
                    activeFrame?.name?.includes('Diamond') ? 'border-cyan-400 ring-4 ring-cyan-400/20' :
                    'border-card ring-1 ring-white/10'
                  )}>
                    {/* Special background for frames */}
                    {activeFrame?.name?.includes('Golden') && (
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-yellow-400/5 z-0" />
                    )}
                    {activeFrame?.name?.includes('Diamond') && (
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-cyan-400/5 z-0" />
                    )}

                    {/* Shimmer effect for legendary frames */}
                    {(activeFrame?.name?.includes('Golden') || activeFrame?.name?.includes('Diamond')) && (
                      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]",
                          activeFrame?.name?.includes('Golden') ? 'via-yellow-100/30' : 'via-cyan-100/30'
                        )} />
                      </div>
                    )}

                    <Image 
                      src={avatarUrl || "/3d_avatar_studify/1.png"} 
                      alt="Avatar" 
                      width={176} 
                      height={176} 
                      className="relative z-[5] object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                    />
                  </div>
                  
                  {user.rank === 1 && (
                    <div className="absolute -top-4 -right-4 bg-primary p-3 rounded-[1.5rem] shadow-2xl z-20 animate-bounce ring-4 ring-card">
                      <Crown size={24} className="text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <h3 className="text-3xl font-black uppercase tracking-tight text-foreground mb-2">
                  {user.displayName}
                </h3>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-10">
                  <AtSign className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    {user.username || 'username'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 w-full pt-10 border-t border-white/10">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-amber-500">
                      <Coins className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Wealth</span>
                    </div>
                    <div className="text-3xl font-black text-foreground tracking-tighter">
                      {user.coins.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <Trophy className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Standing</span>
                    </div>
                    <div className="text-3xl font-black text-foreground tracking-tighter">
                      #{user.rank || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-8 space-y-12">
          {/* Avatar Selection */}
          <div className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50 blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-12 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-6 mb-10">
                <div className="p-4 rounded-[1.5rem] bg-primary/10 text-primary ring-1 ring-primary/20 shadow-inner">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70">Visual Identity</span>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Select Avatar</h3>
                </div>

                <div className="ml-auto flex items-center gap-2 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                  <button
                    onClick={() => setAvatarCategory('male')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300",
                      avatarCategory === 'male' 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setAvatarCategory('female')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300",
                      avatarCategory === 'female' 
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                        : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    Female
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-5 max-h-[400px] overflow-y-auto p-8 rounded-[2.5rem] bg-black/20 border border-white/5 scrollbar-thin scrollbar-thumb-primary/20 scroll-smooth">
                {(avatarCategory === 'male' ? MALE_AVATARS : FEMALE_AVATARS).map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={cn(
                      "relative aspect-square rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 hover:scale-110 active:scale-95 group/opt",
                      avatarUrl === url 
                        ? 'border-primary shadow-2xl shadow-primary/40 ring-4 ring-primary/20 scale-110 z-10 rotate-3' 
                        : 'border-transparent hover:border-primary/40 hover:bg-primary/10'
                    )}
                  >
                    <Image 
                      src={url} 
                      alt="Avatar option" 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover/opt:scale-125"
                    />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                        <CheckCircle2 className="text-white h-8 w-8 drop-shadow-2xl" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Details Form */}
          <div className="group relative overflow-hidden rounded-[3rem] p-1 transition-all duration-700 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-50 blur-xl" />
            <div className="relative bg-card/80 backdrop-blur-3xl rounded-[2.9rem] p-8 md:p-12 border border-white/10 shadow-2xl">
              <div className="flex items-center gap-6 mb-12">
                <div className="p-4 rounded-[1.5rem] bg-accent/10 text-accent ring-1 ring-accent/20 shadow-inner">
                  <User className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/70">
                    {isFirstTimeSetup ? "Initial Setup" : "Personal Info"}
                  </span>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">
                    {isFirstTimeSetup ? "Complete Your Profile" : "Edit Details"}
                  </h3>
                  {isFirstTimeSetup && (
                    <p className="text-xs font-bold text-primary animate-pulse">
                      * Please choose a username to start using StudiFy
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">
                      Display Name
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-primary/10 rounded-[1.5rem] blur-2xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-500" />
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="relative bg-white/5 border-white/10 focus:border-primary/50 h-16 rounded-[1.5rem] px-8 font-black uppercase tracking-wider transition-all text-foreground text-sm placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">
                      Username
                    </label>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-primary/10 rounded-[1.5rem] blur-2xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-500" />
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase())}
                        placeholder="unique_username"
                        className="relative bg-white/5 border-white/10 focus:border-primary/50 h-16 rounded-[1.5rem] px-8 font-black uppercase tracking-wider transition-all text-foreground text-sm placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-2">
                    Bio
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-primary/10 rounded-[1.5rem] blur-2xl opacity-0 group-hover/input:opacity-100 transition-opacity duration-500" />
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Share your learning journey..."
                      rows={4}
                      className="relative bg-white/5 border-white/10 focus:border-primary/50 rounded-[1.5rem] px-8 py-6 font-bold transition-all text-foreground text-base resize-none placeholder:text-muted-foreground/30"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="h-20 px-16 rounded-[2rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/40 transition-all active:scale-95 group/btn overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {saving ? (
                      <div className="flex items-center gap-4">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="font-black uppercase tracking-[0.3em] text-xs">Synchronizing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <Save className="h-6 w-6 transition-transform group-hover/btn:scale-110" />
                        <span className="font-black uppercase tracking-[0.3em] text-xs">Save Identity</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
