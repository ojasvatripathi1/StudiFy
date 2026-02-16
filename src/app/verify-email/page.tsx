"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { StudiFyLogo } from '@/components/icons';
import { auth, signOut } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user?.emailVerified) {
        router.push('/?tab=profile');
      }
    });

    // Check verification status periodically
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          router.push('/?tab=profile');
        }
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [router]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    
    setIsResending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      toast({
        title: "Verification Email Sent",
        description: "Please check your inbox (and spam folder) for the verification link.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-xl relative z-10">
        <div className="mb-12 flex justify-center">
          <Link href="/" className="flex items-center gap-4 group transition-all duration-700 hover:scale-105">
            <div className="relative p-4 bg-primary/10 rounded-[2rem] border border-primary/20 backdrop-blur-2xl group-hover:bg-primary/20 transition-all duration-700">
              <StudiFyLogo className="h-12 w-12 group-hover:animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping opacity-75"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-black tracking-tighter bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent uppercase">
                StudiFy
              </span>
              <span className="text-[10px] font-black tracking-[0.4em] text-muted-foreground/40 uppercase ml-1">AI Based Learning Platform</span>
            </div>
          </Link>
        </div>
        
        <div className="backdrop-blur-3xl bg-card/40 border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] p-12 relative overflow-hidden group/card text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
          
          <div className="mb-8 flex justify-center">
            <div className="p-6 bg-primary/10 rounded-full border border-primary/20">
              <Mail className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground mb-4">Verify Your Email</h1>
          <p className="text-sm font-medium text-muted-foreground mb-8">
            We&apos;ve sent a verification email to <span className="text-foreground font-bold">{user?.email}</span>. 
            Please check your inbox and click the link to verify your account.
          </p>

          <div className="space-y-4">
            <Button 
              onClick={handleResendEmail} 
              disabled={isResending}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isResending ? (
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Mail className="w-5 h-5 mr-2" />
              )}
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleSignOut}
              className="w-full h-14 bg-white/5 border-white/10 hover:bg-white/10 text-foreground font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>Verifying status automatically...</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already verified?{' '}
            <button 
              onClick={() => window.location.reload()}
              className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 hover:underline"
            >
              Refresh page
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
