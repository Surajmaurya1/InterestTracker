"use client";

import { useState, useEffect } from "react";
import { Lock, Delete, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SecurityLock({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [mpin, setMpin] = useState<string | null>(null);

  useEffect(() => {
    const savedPin = localStorage.getItem("app_mpin");
    if (savedPin) {
      setMpin(savedPin);
      setIsLocked(true);
    }
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === mpin) {
          setIsLocked(false);
        } else {
          setError(true);
          setTimeout(() => {
            setError(false);
            setPin("");
          }, 600);
        }
      }
    }
  };

  const handleForgot = () => {
    if (confirm("Reset MPIN? This will clear your security lock but keep your data.")) {
      localStorage.removeItem("app_mpin");
      setIsLocked(false);
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
        <p className="text-zinc-500 text-sm mb-12">Security lock active</p>

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
        <div className="grid grid-cols-3 gap-6 w-full mb-12">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-16 rounded-2xl bg-[#111113] border border-[#1A1A1D] text-xl font-semibold flex items-center justify-center hover:bg-[#1A1A1D] active:scale-95 transition-all mx-auto"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress("0")}
            className="w-16 h-16 rounded-2xl bg-[#111113] border border-[#1A1A1D] text-xl font-semibold flex items-center justify-center hover:bg-[#1A1A1D] active:scale-95 transition-all mx-auto"
          >
            0
          </button>
          <button
            onClick={() => setPin(pin.slice(0, -1))}
            className="w-16 h-16 text-zinc-500 flex items-center justify-center hover:text-white transition-colors mx-auto"
          >
            <Delete size={24} />
          </button>
        </div>

        <button 
          onClick={handleForgot}
          className="flex items-center gap-2 text-zinc-500 text-sm hover:text-white transition-colors"
        >
          <RefreshCcw size={14} />
          <span>Forgot MPIN?</span>
        </button>
      </motion.div>
    </div>
  );
}
