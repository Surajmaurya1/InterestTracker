"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Delete, RefreshCcw, Loader2, KeyRound, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, getProfile, updateMpin } from "@/lib/supabase";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30000; // 30 seconds

export default function SecurityLock({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [mpin, setMpin] = useState<string | null>(null);
  
  // Rate limiting
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);
  
  // Reset Flow States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  useEffect(() => {
    const checkMpin = async () => {
      try {
        const profile = await getProfile();
        if (profile?.mpin) {
          setMpin(profile.mpin);
          setIsLocked(true);
        }
      } catch {
        // Profile check failed, no lock needed
      }
    };
    checkMpin();
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, lockedUntil - Date.now());
      setLockCountdown(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        setLockedUntil(null);
        setAttempts(0);
        setLockCountdown(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil;

  const handleKeyPress = useCallback((num: string) => {
    if (isLockedOut || pin.length >= 4) return;
    
    const newPin = pin + num;
    setPin(newPin);
    if (newPin.length === 4) {
      if (newPin === mpin) {
        setIsLocked(false);
        setAttempts(0);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(true);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_DURATION);
        }
        
        setTimeout(() => {
          setError(false);
          setPin("");
        }, 600);
      }
    }
  }, [pin, mpin, attempts, isLockedOut]);

  const handleMpinReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error("User email not found");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: resetPassword,
      });

      if (signInError) throw new Error("Invalid password. Verification failed.");

      await updateMpin(null);
      setMpin(null);
      setIsLocked(false);
      setShowResetModal(false);
      setResetPassword("");
      setAttempts(0);
      setLockedUntil(null);
    } catch (err: unknown) {
      setResetError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setResetLoading(false);
    }
  };

  if (!isLocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-background z-[1000] flex flex-col items-center justify-center px-6">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center w-full max-w-xs"
      >
        <div className="w-16 h-16 bg-[#111113] border border-[#1A1A1D] rounded-3xl flex items-center justify-center mb-8">
          <Lock size={28} className={error ? "text-red-500" : "text-white"} />
        </div>
        
        <h2 className="text-xl font-bold mb-2">Enter MPIN</h2>
        
        {isLockedOut ? (
          <p className="text-red-500 text-sm mb-12 font-semibold">
            Too many attempts. Try again in {lockCountdown}s
          </p>
        ) : attempts > 0 ? (
          <p className="text-zinc-500 text-sm mb-12">
            {MAX_ATTEMPTS - attempts} attempts remaining
          </p>
        ) : (
          <p className="text-zinc-500 text-sm mb-12">Security lock active</p>
        )}

        {/* PIN Indicators */}
        <div className="flex gap-4 mb-16">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > i 
                  ? "bg-white border-white scale-110" 
                  : "border-[#1A1A1D]"
              } ${error ? "bg-red-500 border-red-500" : ""}`}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full mb-12">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              disabled={isLockedOut}
              onClick={() => handleKeyPress(num)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#111113] border border-[#1A1A1D] text-xl font-semibold flex items-center justify-center hover:bg-[#1A1A1D] active:scale-95 transition-all mx-auto disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            disabled={isLockedOut}
            onClick={() => handleKeyPress("0")}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#111113] border border-[#1A1A1D] text-xl font-semibold flex items-center justify-center hover:bg-[#1A1A1D] active:scale-95 transition-all mx-auto disabled:opacity-30 disabled:cursor-not-allowed"
          >
            0
          </button>
          <button
            onClick={() => setPin(pin.slice(0, -1))}
            className="w-14 h-14 sm:w-16 sm:h-16 text-zinc-500 flex items-center justify-center hover:text-white transition-colors mx-auto"
          >
            <Delete size={24} />
          </button>
        </div>

        <button 
          onClick={() => { setShowResetModal(true); setResetPassword(""); setResetError(null); }}
          className="flex items-center gap-2 text-zinc-500 text-sm hover:text-white transition-colors"
        >
          <RefreshCcw size={14} />
          <span>Forgot MPIN?</span>
        </button>
      </motion.div>

      {/* Reset Modal Overlay */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1100] flex items-center justify-center px-4 sm:px-6 p-4">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#111113] border border-[#1A1A1D] w-full max-w-sm rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute right-5 top-5 sm:right-6 sm:top-6 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col gap-6">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <KeyRound size={24} className="text-red-500" />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold text-white">Reset Security Lock</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed px-2 sm:px-4">
                    Verify your identity by entering your account password.
                  </p>
                </div>

                <form onSubmit={handleMpinReset} className="flex flex-col gap-4">
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-white transition-colors" size={18} />
                    <input 
                      required
                      type="password" 
                      placeholder="Enter Password"
                      autoComplete="current-password"
                      className="w-full bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-zinc-600 transition-all font-medium"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                    />
                  </div>

                  {resetError && (
                    <p className="text-red-500 text-xs font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center">
                      {resetError}
                    </p>
                  )}

                  <button 
                    disabled={resetLoading}
                    className="w-full bg-white text-black font-bold h-14 rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                  >
                    {resetLoading ? <Loader2 className="animate-spin" size={20} /> : "Verify Identity"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
