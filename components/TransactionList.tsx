import { Transaction } from "@/types/transaction";
import TransactionItem from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onItemClick: (transaction: Transaction) => void;
}

export default function TransactionList({ transactions, onDelete, onItemClick }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2 border border-dashed border-[#1A1A1D] rounded-3xl">
        <span className="text-sm">No transactions yet</span>
        <span className="text-xs">Tap the + button to add one</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-2 mb-1">
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">Recent Transactions</h3>
        <button className="text-xs text-zinc-500 hover:text-white transition-colors">See all</button>
      </div>
      <div className="flex flex-col gap-3">
        {transactions.map((t) => (
          <TransactionItem 
            key={t.id} 
            transaction={t} 
            onDelete={() => onDelete(t.id)} 
            onClick={() => onItemClick(t)}
          />
        ))}
      </div>
    </div>
  );
}
