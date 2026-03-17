import { User } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";

interface TransactionItemProps {
  transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-[#161618] rounded-2xl hover:bg-[#1A1A1D] transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-[#1A1A1D] rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
          <User size={22} />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-white">{transaction.person_name}</span>
          <span className="text-xs text-zinc-500">{format(parseISO(transaction.date), "MMM dd, yyyy")}</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="font-semibold text-white">₹{Number(transaction.amount).toLocaleString()}</span>
        <span className="text-[10px] text-zinc-500">{transaction.interest}% interest</span>
      </div>
    </div>
  );
}
