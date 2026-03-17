"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, User, Calendar, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isLending = transaction.type !== 'collection';

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#111113] border border-[#1A1A1D] rounded-3xl p-8 z-50 animate-in zoom-in-95 duration-200 shadow-2xl outline-none">
          <div className="flex items-center justify-between mb-8">
            <Dialog.Title className="text-xl font-semibold">Transaction Details</Dialog.Title>
            <Dialog.Close className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-8">
            {/* Header / Person */}
            <div className="flex items-center gap-5 p-4 bg-white/5 rounded-3xl border border-white/5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isLending ? "bg-[#1A1A1D] text-zinc-400" : "bg-green-500/10 text-green-500"
              }`}>
                {isLending ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white tracking-wide">{transaction.person_name}</span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  {isLending ? "Lending Entry" : "Collection Entry"}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-[#1A1A1D] rounded-3xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <CreditCard size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Amount</span>
                </div>
                <span className={`text-xl font-bold ${!isLending ? "text-green-500" : "text-white"}`}>
                  ₹{Number(transaction.amount).toLocaleString()}
                </span>
              </div>

              <div className="p-5 bg-[#1A1A1D] rounded-3xl flex flex-col gap-2">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Date</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {format(parseISO(transaction.date), "MMM dd, yyyy")}
                </span>
              </div>

              {isLending && (
                <div className="col-span-2 p-5 bg-[#1A1A1D] rounded-3xl flex items-center justify-between">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <TrendingUp size={14} />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Daily Interest</span>
                    </div>
                    <span className="text-xl font-bold text-white tracking-widest">₹{transaction.interest} / day</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Monthly Projection</span>
                    <span className="text-sm font-semibold text-zinc-400">₹{(transaction.interest * 30).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button 
              onClick={onClose}
              className="mt-4 w-full h-14 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
