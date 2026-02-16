import { LoginForm } from '@/components/LoginForm';
import { StudiFyLogo } from '@/components/icons';
import Link from 'next/link';

export default function LoginPage() {
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
        
        <div className="backdrop-blur-3xl bg-card/40 border border-white/10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] p-12 relative overflow-hidden group/card">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-1000" />
          <LoginForm />
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link 
              href="/signup" 
              className="font-semibold text-primary hover:text-primary/80 transition-colors duration-200 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 opacity-20 animate-float">
        <div className="w-4 h-4 bg-primary rounded-full"></div>
      </div>
      <div className="absolute bottom-20 right-20 opacity-20 animate-float-delayed">
        <div className="w-3 h-3 bg-accent rounded-full"></div>
      </div>
    </div>
  );
}
