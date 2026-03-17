"use client";

import { useEffect, useRef } from "react";
import { Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { formatCurrency, formatInterestLabel } from "@/lib/interest";

interface TransactionItemProps {
  transaction: Transaction;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onClick: () => void;
}

const SWIPE_ACTION_WIDTH = 104;
const SWIPE_TRIGGER = 52;
const VELOCITY_TRIGGER = -500;

export default function TransactionItem({
  transaction,
  isOpen,
  onOpenChange,
  onDelete,
  onClick,
}: TransactionItemProps) {
  const x = useMotionValue(0);
  const dragMovedRef = useRef(false);
  const isLending = transaction.type !== "collection";

  const revealProgress = useTransform(x, [-SWIPE_ACTION_WIDTH, 0], [1, 0]);
  const deleteScale = useTransform(revealProgress, [0, 1], [0.82, 1]);
  const deleteOpacity = useTransform(revealProgress, [0, 0.2, 1], [0, 0.55, 1]);
  const deleteX = useTransform(revealProgress, [0, 1], [14, 0]);
  const cardScale = useTransform(x, [-SWIPE_ACTION_WIDTH, 0], [0.985, 1]);
  const cardRotate = useTransform(x, [-SWIPE_ACTION_WIDTH, 0], [-0.35, 0]);
  const glowOpacity = useTransform(revealProgress, [0, 1], [0, 1]);
  const sheenOpacity = useTransform(revealProgress, [0, 1], [1, 0.94]);

  useEffect(() => {
    animate(x, isOpen ? -SWIPE_ACTION_WIDTH : 0, {
      type: "spring",
      stiffness: 440,
      damping: 36,
      mass: 0.8,
    });
  }, [isOpen, x]);

  const triggerHaptic = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-[24px]">
      <motion.div
        aria-hidden="true"
        style={{ opacity: glowOpacity }}
        className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_right,_rgba(248,113,113,0.28),_transparent_58%)]"
      />

      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-[1px] overflow-hidden rounded-[22px]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(127,29,29,0.96),rgba(220,38,38,0.92)_48%,rgba(248,113,113,0.88))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.24),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08))]" />

        <motion.button
          type="button"
          onClick={onDelete}
          style={{ scale: deleteScale, x: deleteX, opacity: deleteOpacity }}
          className="absolute inset-y-0 right-0 flex w-[104px] items-center justify-center"
        >
          <span className="flex h-[72px] w-[72px] flex-col items-center justify-center gap-1 rounded-[22px] border border-white/15 bg-black/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-transform group-active:scale-95">
            <Trash2 size={18} strokeWidth={2.25} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Delete</span>
          </span>
        </motion.button>
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -SWIPE_ACTION_WIDTH - 24, right: 0 }}
        dragElastic={{ left: 0.08, right: 0.02 }}
        dragMomentum={false}
        style={{ x, scale: cardScale, rotateZ: cardRotate }}
        onDragStart={() => {
          dragMovedRef.current = false;
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) > 6) {
            dragMovedRef.current = true;
          }
          if (!isOpen && info.offset.x < -8) {
            onOpenChange(true);
          }
        }}
        onDragEnd={(_, info) => {
          const shouldOpen = info.offset.x < -SWIPE_TRIGGER || info.velocity.x < VELOCITY_TRIGGER;
          if (shouldOpen !== isOpen) {
            triggerHaptic();
          }
          onOpenChange(shouldOpen);
        }}
        onTap={() => {
          if (dragMovedRef.current) return;
          if (isOpen) {
            onOpenChange(false);
            return;
          }
          onClick();
        }}
        whileTap={{ scale: 0.992 }}
        className="relative z-10 cursor-pointer rounded-[24px] border border-[#1A1A1D] bg-[#111113]/96 px-4 py-4 shadow-[0_16px_36px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-xl transition-colors hover:bg-[#151518] active:cursor-grabbing"
      >
        <motion.div
          style={{ opacity: sheenOpacity }}
          className="pointer-events-none absolute inset-0 rounded-[24px] bg-[linear-gradient(135deg,rgba(255,255,255,0.045),transparent_35%,transparent_65%,rgba(255,255,255,0.025))]"
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-[18px] border ${
                isLending
                  ? "border-white/5 bg-[#1A1A1D] text-zinc-300"
                  : "border-green-500/20 bg-green-500/10 text-green-400"
              }`}
            >
              {isLending ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold tracking-wide text-white">{transaction.person_name}</span>
              <span className="text-[11px] font-medium text-zinc-500">{format(parseISO(transaction.date), "MMM dd, yyyy")}</span>
            </div>
          </div>

          <div className="relative flex flex-col items-end gap-0.5 text-right">
            <span className={`text-base font-semibold tracking-tight ${isLending ? "text-white" : "text-green-500"}`}>
              {isLending ? "" : "+"}
              {formatCurrency(Number(transaction.amount))}
            </span>
            {isLending ? (
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                {formatInterestLabel(transaction)}
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-500/50">Received</span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
