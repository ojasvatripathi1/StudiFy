"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { signUp, signInWithGoogle } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  displayName: z.string().min(3, { message: 'Display name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password, values.displayName);
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your inbox to verify your account.',
      });
      router.push('/verify-email');
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }
      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: 'Successfully signed in with Google!',
        description: 'Welcome to StudiFy!',
      });
      router.push('/');
    } catch (error: unknown) {
      const err = error as { message?: string };
      // Don't show toast if user just closed the popup
      if (err.message === 'The sign-in popup was closed before completing the sign-in process.') {
        console.log('Google Sign Up: Popup closed by user');
      } else {
        console.error('Google sign in error:', error);
        toast({
          title: 'Google Sign In Failed',
          description: err.message || 'Failed to sign in with Google. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-2">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Registration</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Create Account</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Join the elite community of learners.</p>
        
        <div className="flex items-center justify-center gap-3 mt-6 p-4 bg-primary/5 backdrop-blur-3xl rounded-2xl border border-primary/10 group/bonus overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 translate-x-[-100%] group-hover/bonus:translate-x-[100%] transition-transform duration-1000" />
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Welcome Bonus: 500 Coins!</span>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Display Name</FormLabel>
                  <FormControl>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover/input:opacity-100 transition-opacity" />
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="relative h-14 bg-white/5 border-white/10 focus:border-primary/50 rounded-2xl px-6 font-bold transition-all text-foreground placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase tracking-wider text-destructive ml-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover/input:opacity-100 transition-opacity" />
                      <Input 
                        placeholder="name@example.com" 
                        {...field} 
                        className="relative h-14 bg-white/5 border-white/10 focus:border-primary/50 rounded-2xl px-6 font-bold transition-all text-foreground placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase tracking-wider text-destructive ml-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Secure Password</FormLabel>
                  <FormControl>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover/input:opacity-100 transition-opacity" />
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="relative h-14 bg-white/5 border-white/10 focus:border-primary/50 rounded-2xl px-6 font-bold transition-all text-foreground placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase tracking-wider text-destructive ml-1" />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-6 pt-2">
            <Button 
              type="submit" 
              className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 transition-all active:scale-95 group/btn overflow-hidden relative" 
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="font-black uppercase tracking-[0.2em] text-[10px]">Processing...</span>
                </div>
              ) : (
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Create Account</span>
              )}
            </Button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card/50 backdrop-blur-md px-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Or register with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group/google active:scale-95" 
              disabled={isLoading}
              onClick={handleGoogleSignUp}
            >
              <svg className="mr-3 h-5 w-5 transition-transform group-hover/google:scale-110" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-black uppercase tracking-[0.2em] text-[10px]">
                {isLoading ? 'Verifying...' : 'Sign up with Google'}
              </span>
            </Button>

            <div className="text-center pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 leading-relaxed">
                By creating an account, you agree to our<br />
                <span className="text-primary/60 hover:text-primary transition-colors cursor-pointer">Terms of Service</span> and <span className="text-primary/60 hover:text-primary transition-colors cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
