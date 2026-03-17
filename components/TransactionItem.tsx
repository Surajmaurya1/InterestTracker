"use client";

import { User, Trash2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: () => void;
  onClick: () => void;
}

export default function TransactionItem({ transaction, onDelete, onClick }: TransactionItemProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5]);

  const isLending = transaction.type !== 'collection';

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete Action Background - strictly contained */}
      <div 
        className="absolute inset-[1px] flex items-center justify-end px-6 bg-red-600/90 cursor-pointer rounded-2xl"
        onClick={onDelete}
      >
        <motion.div style={{ opacity, scale }}>
          <Trash2 size={24} className="text-white" />
        </motion.div>
      </div>

      {/* Foreground Swipeable Content */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.05}
        onClick={onClick}
        className="relative z-10 flex items-center justify-between p-4 bg-[#111113] border border-[#1A1A1D] rounded-2xl hover:bg-[#1A1A1D] transition-colors group cursor-pointer active:cursor-grabbing"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
            isLending ? "bg-[#1A1A1D] text-zinc-400" : "bg-green-500/10 text-green-500"
          }`}>
            {isLending ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-white tracking-wide">{transaction.person_name}</span>
            <span className="text-[11px] font-medium text-zinc-500">{format(parseISO(transaction.date), "MMM dd, yyyy")}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className={`text-base font-semibold tracking-tight ${isLending ? "text-white" : "text-green-500"}`}>
            {isLending ? "" : "+"}₹{Number(transaction.amount).toLocaleString()}
          </span>
          {isLending && (
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">₹{transaction.interest} / day</span>
          )}
          {!isLending && (
            <span className="text-[10px] font-bold text-green-500/50 uppercase tracking-widest">Received</span>
          )}
        </div>
      </motion.div>
    </div>
  );
}
