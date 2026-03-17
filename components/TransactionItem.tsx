import { User, Trash2 } from "lucide-react";
import { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";
import { motion, useMotionValue, useTransform } from "framer-motion";

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: () => void;
}

export default function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5]);

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
        className="relative z-10 flex items-center justify-between p-4 bg-[#111113] border border-[#1A1A1D] rounded-2xl hover:bg-[#1A1A1D] transition-colors group cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1A1A1D] rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
            <User size={22} />
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white">{transaction.person_name}</span>
            <span className="text-xs text-zinc-500">{format(parseISO(transaction.date), "MMM dd, yyyy")}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-base font-semibold text-white tracking-tight">₹{Number(transaction.amount).toLocaleString()}</span>
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">₹{transaction.interest} / day</span>
        </div>
      </motion.div>
    </div>
  );
}
