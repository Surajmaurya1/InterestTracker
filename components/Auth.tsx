"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useFeedback } from "@/components/ui/feedback";

export default function Auth() {
  const { showToast } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError("Please enter your email");
      return;
    }

    if (isSignUp && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({ email: trimmedEmail, password });
        if (signUpError) throw signUpError;
        showToast({
          tone: "success",
          title: "Account created",
          message: "Check your email for the confirmation link.",
        });
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (signInError) throw signInError;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col gap-8 rounded-[32px] border border-[#1A1A1D] bg-[#111113] p-8 shadow-2xl sm:rounded-[40px] sm:p-10"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-zinc-500">
            {isSignUp ? "Join the premium interest tracking experience" : "Sign in to manage your lending activity"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="group relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-white" size={18} />
              <input
                required
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="w-full rounded-2xl border border-transparent bg-[#1A1A1D] py-4 pl-12 pr-4 font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="group relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-white" size={18} />
              <input
                required
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={6}
                className="w-full rounded-2xl border border-transparent bg-[#1A1A1D] py-4 pl-12 pr-12 font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-xs font-medium text-red-500">{error}</p>}

          <button
            disabled={loading}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isSignUp ? "Get Started" : "Sign In"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1A1A1D]" />
            </div>
            <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
              <span className="bg-[#111113] px-4 text-zinc-600">Or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-center text-sm font-semibold text-zinc-400 transition-colors hover:text-white"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
