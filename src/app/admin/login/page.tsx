"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { signInWithGoogle, signOut } from "@/lib/firebase";
import { ShieldCheck, ShieldX, LogIn } from "lucide-react";

const ADMIN_EMAIL = "ojasvatripathi@gmail.com";

export default function AdminLoginPage() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user && user.email === ADMIN_EMAIL) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    setError("");
    setSigningIn(true);
    try {
      const result = await signInWithGoogle();
      if (result && "email" in result) {
        if (result.email !== ADMIN_EMAIL) {
          await signOut();
          setError(`Access denied. Only ${ADMIN_EMAIL} can access the admin panel.`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign-in failed.";
      if (!msg.toLowerCase().includes("popup-closed")) {
        setError(msg);
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070d] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white/[0.03] border border-white/8 rounded-3xl p-10 backdrop-blur-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]">
          {/* Top accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent rounded-full" />

          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-500/25">
                <ShieldCheck className="w-8 h-8 text-black" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#07070d] animate-pulse" />
            </div>
          </div>

          {/* Headings */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Access</h1>
            <p className="text-white/30 text-sm mt-2">
              Restricted to authorized administrators only
            </p>
          </div>

          {/* Error box */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <ShieldX className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-300 leading-relaxed">{error}</p>
            </div>
          )}

          {/* Google sign in button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={signingIn || loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-white/90 active:bg-white/80 text-black font-bold rounded-2xl py-3.5 px-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20 group"
          >
            {signingIn ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                <span>Verifying…</span>
              </>
            ) : (
              <>
                {/* Google G logo */}
                <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
                <LogIn className="w-4 h-4 ml-auto opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-200" />
              </>
            )}
          </button>

          {/* Authorized email hint */}
          <p className="text-center text-[10px] text-white/20 mt-6 uppercase tracking-[0.2em]">
            Authorized: {ADMIN_EMAIL}
          </p>
        </div>

        {/* Back to site */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-white/20 hover:text-white/50 transition-colors duration-200"
          >
            ← Back to StudiFy
          </a>
        </div>
      </div>
    </div>
  );
}
