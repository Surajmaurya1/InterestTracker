"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
}

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
}

interface PendingConfirm {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
}

interface FeedbackContextValue {
  showToast: (options: Omit<ToastItem, "id">) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const TOAST_STYLES: Record<ToastTone, string> = {
  success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
  error: "border-red-500/20 bg-red-500/10 text-red-100",
  info: "border-white/10 bg-white/5 text-white",
};

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmQueue, setConfirmQueue] = useState<PendingConfirm[]>([]);
  const [activeConfirm, setActiveConfirm] = useState<PendingConfirm | null>(null);
  const nextToastId = useRef(1);

  const showToast = useCallback((options: Omit<ToastItem, "id">) => {
    const id = nextToastId.current++;
    setToasts((current) => [...current, { id, ...options }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmQueue((current) => [...current, { options, resolve }]);
    });
  }, []);

  useEffect(() => {
    if (activeConfirm || confirmQueue.length === 0) return;

    const [nextConfirm, ...rest] = confirmQueue;
    setActiveConfirm(nextConfirm);
    setConfirmQueue(rest);
  }, [activeConfirm, confirmQueue]);

  const handleConfirmClose = useCallback((value: boolean) => {
    if (!activeConfirm) return;
    activeConfirm.resolve(value);
    setActiveConfirm(null);
  }, [activeConfirm]);

  useEffect(() => {
    return () => {
      if (activeConfirm) {
        activeConfirm.resolve(false);
      }
      confirmQueue.forEach((pending) => pending.resolve(false));
    };
  }, [activeConfirm, confirmQueue]);

  const value = useMemo(() => ({ showToast, confirm }), [showToast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[1200] flex justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: -18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                className={`pointer-events-auto rounded-[24px] border px-4 py-4 shadow-[0_24px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl ${TOAST_STYLES[toast.tone]}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {toast.tone === "success" ? <CheckCircle2 size={18} /> : toast.tone === "error" ? <AlertTriangle size={18} /> : <Info size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{toast.title}</p>
                    {toast.message && <p className="mt-1 text-sm text-white/70">{toast.message}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                    className="rounded-full p-1 text-white/50 transition-colors hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeConfirm && (
          <div className="fixed inset-0 z-[1250] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => handleConfirmClose(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="relative z-10 w-full max-w-sm rounded-[28px] border border-white/10 bg-[#111113]/95 p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white">
                <AlertTriangle size={20} className={activeConfirm.options.tone === "danger" ? "text-red-400" : "text-white"} />
              </div>
              <h3 className="text-lg font-semibold text-white">{activeConfirm.options.title}</h3>
              {activeConfirm.options.message && <p className="mt-2 text-sm leading-6 text-zinc-400">{activeConfirm.options.message}</p>}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleConfirmClose(false)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {activeConfirm.options.cancelLabel ?? "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmClose(true)}
                  className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                    activeConfirm.options.tone === "danger"
                      ? "bg-red-500 text-white hover:bg-red-400"
                      : "bg-white text-black hover:bg-zinc-200"
                  }`}
                >
                  {activeConfirm.options.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }
  return context;
}
