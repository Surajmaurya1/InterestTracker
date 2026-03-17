"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Shield, Lock, Eye, EyeOff, Trash2, LogOut } from "lucide-react";
import { supabase, getProfile, updateMpin } from "@/lib/supabase";

interface SettingsModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function SettingsModal({ isOpen, setIsOpen }: SettingsModalProps) {
  const [mpin, setMpin] = useState("");
  const [isMpinSet, setIsMpinSet] = useState(false);
  const [showMpin, setShowMpin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const profile = await getProfile();
        if (profile?.mpin) {
          setIsMpinSet(true);
        }
      } catch (err) {
        console.error("Error fetching MPIN status:", err);
      }
    };
    if (isOpen) fetchStatus();
  }, [isOpen]);

  const handleSetMpin = async () => {
    if (mpin.length !== 4) {
      alert("MPIN must be 4 digits");
      return;
    }
    setLoading(true);
    try {
      await updateMpin(mpin);
      setIsMpinSet(true);
      setMpin("");
      alert("Cloud MPIN set successfully!");
    } catch (err) {
      alert("Failed to sync MPIN to cloud.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMpin = async () => {
    if (confirm("Are you sure you want to remove the security lock?")) {
      setLoading(true);
      try {
        await updateMpin(null);
        setIsMpinSet(false);
      } catch (err) {
        alert("Failed to remove MPIN.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111113] border border-[#1A1A1D] rounded-3xl p-8 z-50 animate-in zoom-in-95 duration-200 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/5 rounded-xl">
                <Shield size={22} className="text-white" />
              </div>
              <Dialog.Title className="text-xl font-semibold">Settings</Dialog.Title>
            </div>
            <Dialog.Close className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Security Lock (MPIN)</h3>
                  <p className="text-xs text-zinc-500 mt-1">Require a 4-digit code to open the app.</p>
                </div>
                {isMpinSet && (
                  <button 
                    onClick={handleRemoveMpin}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {!isMpinSet ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showMpin ? "text" : "password"}
                      maxLength={4}
                      placeholder="Set 4-digit MPIN"
                      className="w-full bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl px-4 py-3 text-white placeholder:text-zinc-600 transition-all font-medium"
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
                    />
                    <button 
                      onClick={() => setShowMpin(!showMpin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    >
                      {showMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button 
                    onClick={handleSetMpin}
                    className="bg-white text-black px-6 rounded-2xl font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <div className="bg-green-500/5 border border-green-500/10 rounded-2xl p-4 flex items-center gap-3">
                  <Lock size={18} className="text-green-500" />
                  <span className="text-sm text-green-500/90 font-medium">MPIN Security is Active</span>
                </div>
              )}
            </section>

            <section className="pt-4 border-t border-[#1A1A1D] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">App Version</h3>
                  <p className="text-xs text-zinc-500 mt-1">Latest production build</p>
                </div>
                <span className="text-xs font-mono text-zinc-600">v1.2.0</span>
              </div>

              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl group hover:bg-red-500/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-500">Sign Out</span>
                </div>
                <span className="text-[10px] text-red-500/40 uppercase font-bold tracking-widest hidden group-hover:block transition-all">End Session</span>
              </button>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
