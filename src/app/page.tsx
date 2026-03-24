"use client";

import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';
import LandingPage from '@/components/LandingPage';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="flex flex-col space-y-6 items-center">
          <div className="relative">
            <div className="w-16 h-16 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 w-16 h-16 bg-primary/40 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-3 text-center">
            <Skeleton className="h-6 w-48 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  return <LandingPage />;
}
