"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { signIn, signInWithGoogle } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const userCredential = await signIn(values.email, values.password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        toast({
          title: 'Email Not Verified',
          description: 'Please verify your email address before logging in.',
          variant: 'destructive',
        });
        router.push('/verify-email');
        return;
      }
      
      router.push('/');
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (error: unknown) {
      // Don't show toast if user just closed the popup
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage === 'The sign-in popup was closed before completing the sign-in process.') {
        console.log('Google Sign In: Popup closed by user');
      } else {
        toast({
          title: 'Google Sign In Failed',
          description: errorMessage || 'Failed to sign in with Google. Please try again.',
          variant: 'destructive',
        });
        console.error('Google sign in error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-2">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Authentication</span>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground">Welcome Back</h1>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Enter your credentials to access your dashboard.</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
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
                  <span className="font-black uppercase tracking-[0.2em] text-[10px]">Verifying...</span>
                </div>
              ) : (
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Sign In</span>
              )}
            </Button>
            
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card/50 backdrop-blur-md px-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">Or continue with</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-16 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group/google active:scale-95" 
              disabled={isLoading}
              onClick={handleGoogleSignIn}
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
                {isLoading ? 'Verifying...' : 'Sign in with Google'}
              </span>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
