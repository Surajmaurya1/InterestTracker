"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import ChartCard from "@/components/ChartCard";
import TransactionList from "@/components/TransactionList";
import FloatingButton from "@/components/FloatingButton";
import AddTransactionModal from "@/components/AddTransactionModal";
import { fetchTransactions, deleteTransaction } from "@/lib/supabase";
import { Transaction } from "@/types/transaction";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      setTransactions(transactions.filter(t => t.id !== id));
      await deleteTransaction(id);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
      loadData(); // Revert on error
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalGiven = transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const avgInterest = transactions.length > 0 
      ? transactions.reduce((acc, curr) => acc + Number(curr.interest), 0) / transactions.length 
      : 0;
    
    return {
      totalGiven,
      count: transactions.length,
      avgInterest: avgInterest.toFixed(1)
    };
  }, [transactions]);

  return (
    <main className="min-h-screen max-w-lg mx-auto bg-background text-white pb-24 relative">
      <Header />
      
      <div className="px-6 flex flex-col gap-8 mt-4">
        {/* Main Stats Card */}
        <section className="flex flex-col gap-4">
          <StatsCard 
            label="Total Given" 
            value={`₹${stats.totalGiven.toLocaleString()}`} 
            subValue="" 
          />
          <ChartCard transactions={transactions} />
        </section>

        {/* Mini Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#111113] border border-[#1A1A1D] rounded-3xl p-5 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Transactions</span>
            <span className="text-2xl font-semibold">{stats.count}</span>
          </div>
          <div className="bg-[#111113] border border-[#1A1A1D] rounded-3xl p-5 flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Avg. Daily Interest</span>
            <span className="text-2xl font-semibold">₹{stats.avgInterest}</span>
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <TransactionList transactions={transactions} onDelete={handleDelete} />
        </section>
      </div>

      <FloatingButton onClick={() => setIsModalOpen(true)} />
      
      <AddTransactionModal 
        isOpen={isModalOpen} 
        setIsOpen={setIsModalOpen} 
        onSuccess={loadData} 
      />

      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-zinc-400 font-medium">Syncing with Supabase...</span>
          </div>
        </div>
      )}
    </main>
  );
}
