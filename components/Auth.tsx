"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function Auth() {
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
        const { error } = await supabase.auth.signUp({ email: trimmedEmail, password });
        if (error) throw error;
        alert("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#111113] border border-[#1A1A1D] rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 flex flex-col gap-8 shadow-2xl"
      >
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isSignUp ? "Join the premium interest tracking experience" : "Sign in to manage your lending activity"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
              <input 
                required
                type="email" 
                placeholder="Email address"
                autoComplete="email"
                className="w-full bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
              <input 
                required
                type={showPassword ? "text" : "password"} 
                placeholder="Password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={6}
                className="w-full bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-zinc-600 transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</p>}

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-bold h-14 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
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
              <div className="w-full border-t border-[#1A1A1D]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-[#111113] px-4 text-zinc-600">Or</span>
            </div>
          </div>

          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors text-center"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
