"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Calendar, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";
import { formatCurrency, formatInterestLabel, getMonthlyInterestProjection } from "@/lib/interest";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (transactionId: string) => void;
}

export default function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onDelete,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isLending = transaction.type !== "collection";

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[#1A1A1D] bg-[#111113] p-6 shadow-2xl outline-none animate-in zoom-in-95 duration-200 sm:p-8">
          <div className="mb-8 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold">Transaction Details</Dialog.Title>
            <Dialog.Close className="p-2 text-zinc-400 transition-colors hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-5 rounded-3xl border border-white/5 bg-white/5 p-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                isLending ? "bg-[#1A1A1D] text-zinc-400" : "bg-green-500/10 text-green-500"
              }`}>
                {isLending ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-wide text-white">{transaction.person_name}</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  {isLending ? "Lending Entry" : "Collection Entry"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 rounded-3xl bg-[#1A1A1D] p-5">
                <div className="flex items-center gap-2 text-zinc-500">
                  <CreditCard size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Amount</span>
                </div>
                <span className={`text-xl font-bold ${!isLending ? "text-green-500" : "text-white"}`}>
                  {formatCurrency(Number(transaction.amount))}
                </span>
              </div>

              <div className="flex flex-col gap-2 rounded-3xl bg-[#1A1A1D] p-5">
                <div className="flex items-center gap-2 text-zinc-500">
                  <Calendar size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Date</span>
                </div>
                <span className="text-lg font-semibold text-white">
                  {format(parseISO(transaction.date), "MMM dd, yyyy")}
                </span>
              </div>

              {isLending && (
                <div className="col-span-2 flex items-center justify-between gap-4 rounded-3xl bg-[#1A1A1D] p-5">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <TrendingUp size={14} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Interest Setup</span>
                    </div>
                    <span className="text-xl font-bold tracking-widest text-white">{formatInterestLabel(transaction)}</span>
                  </div>
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-500">Estimated Monthly Interest</span>
                    <span className="text-sm font-semibold text-zinc-400">{formatCurrency(getMonthlyInterestProjection(transaction))}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="h-14 w-full rounded-2xl bg-white font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"
              >
                Done
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(transaction.id);
                }}
                className="h-14 w-full rounded-2xl bg-red-500 font-bold text-white transition-all hover:bg-red-400 active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
