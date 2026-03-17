"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Shield, Lock, Eye, EyeOff, Trash2, LogOut } from "lucide-react";
import { supabase, getProfile, updateMpin } from "@/lib/supabase";
import { useFeedback } from "@/components/ui/feedback";

interface SettingsModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function SettingsModal({ isOpen, setIsOpen }: SettingsModalProps) {
  const { showToast, confirm } = useFeedback();
  const [mpin, setMpin] = useState("");
  const [isMpinSet, setIsMpinSet] = useState(false);
  const [showMpin, setShowMpin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const profile = await getProfile();
        setIsMpinSet(Boolean(profile?.mpin));
      } catch (err) {
        console.error("Error fetching MPIN status:", err);
      }
    };
    if (isOpen) fetchStatus();
  }, [isOpen]);

  const handleSetMpin = async () => {
    if (mpin.length !== 4) {
      showToast({ tone: "error", title: "MPIN must be 4 digits" });
      return;
    }
    setLoading(true);
    try {
      await updateMpin(mpin);
      setIsMpinSet(true);
      setMpin("");
      showToast({ tone: "success", title: "MPIN updated", message: "Your security lock is now active." });
    } catch (err) {
      console.error("Error setting MPIN:", err);
      showToast({ tone: "error", title: "Could not update MPIN", message: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMpin = async () => {
    const approved = await confirm({
      title: "Remove security lock?",
      message: "This will disable MPIN protection for the app.",
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!approved) return;

    setLoading(true);
    try {
      await updateMpin(null);
      setIsMpinSet(false);
      showToast({ tone: "success", title: "Security lock removed" });
    } catch (err) {
      console.error("Error removing MPIN:", err);
      showToast({ tone: "error", title: "Could not remove MPIN", message: "Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const approved = await confirm({
      title: "Sign out now?",
      message: "You can sign back in anytime with your account.",
      confirmLabel: "Sign Out",
      tone: "danger",
    });
    if (!approved) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;

      setIsOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Error signing out:", err);
      showToast({
        tone: "error",
        title: "Could not sign out",
        message: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[#1A1A1D] bg-[#111113] p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/5 p-2">
                <Shield size={22} className="text-white" />
              </div>
              <Dialog.Title className="text-xl font-semibold">Settings</Dialog.Title>
            </div>
            <Dialog.Close className="p-2 text-zinc-400 transition-colors hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">Security Lock (MPIN)</h3>
                  <p className="mt-1 text-xs text-zinc-500">Require a 4-digit code to open the app.</p>
                </div>
                {isMpinSet && (
                  <button
                    type="button"
                    onClick={handleRemoveMpin}
                    className="rounded-xl p-2 text-red-500 transition-colors hover:bg-red-500/10"
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
                      className="w-full rounded-2xl border border-transparent bg-[#1A1A1D] px-4 py-3 font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700"
                      value={mpin}
                      onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMpin(!showMpin)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    >
                      {showMpin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleSetMpin}
                    className="rounded-2xl bg-white px-6 font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
                  >
                    Set
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl border border-green-500/10 bg-green-500/5 p-4">
                  <Lock size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-green-500/90">MPIN Security is Active</span>
                </div>
              )}
            </section>

            <section className="space-y-6 border-t border-[#1A1A1D] pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">App Version</h3>
                  <p className="mt-1 text-xs text-zinc-500">Latest production build</p>
                </div>
                <span className="font-mono text-xs text-zinc-600">v1.2.0</span>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="group flex w-full items-center justify-between rounded-2xl border border-red-500/10 bg-red-500/5 p-4 transition-all hover:bg-red-500/10"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} className="text-red-500" />
                  <span className="text-sm font-semibold text-red-500">Sign Out</span>
                </div>
                <span className="hidden text-[10px] font-bold uppercase tracking-widest text-red-500/40 transition-all group-hover:block">End Session</span>
              </button>
            </section>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
