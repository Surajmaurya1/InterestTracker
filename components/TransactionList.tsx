"use client";

import { useState } from "react";
import { Transaction } from "@/types/transaction";
import TransactionItem from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onItemClick: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onDelete, onItemClick }: TransactionListProps) {
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-[#1A1A1D] py-12 text-zinc-500">
        <span className="text-sm">No transactions yet</span>
        <span className="text-xs">Tap the + button to add one</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="mb-1 flex items-center justify-between px-2">
        <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-400">Recent Transactions</h3>
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-600">Swipe to delete</span>
      </div>
      <div className="flex flex-col gap-3">
        {transactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            isOpen={openSwipeId === transaction.id}
            onOpenChange={(nextOpen) => setOpenSwipeId(nextOpen ? transaction.id : null)}
            onDelete={() => {
              setOpenSwipeId(null);
              onDelete(transaction.id);
            }}
            onClick={() => {
              setOpenSwipeId(null);
              onItemClick(transaction);
            }}
          />
        ))}
      </div>
    </div>
  );
}
