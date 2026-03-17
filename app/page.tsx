"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import ChartCard from "@/components/ChartCard";
import TransactionList from "@/components/TransactionList";
import FloatingButton from "@/components/FloatingButton";
import AddTransactionModal from "@/components/AddTransactionModal";
import SettingsModal from "@/components/SettingsModal";
import SecurityLock from "@/components/SecurityLock";
import TransactionDetailModal from "@/components/TransactionDetailModal";
import Auth from "@/components/Auth";
import { supabase, fetchTransactions, deleteTransaction } from "@/lib/supabase";
import { Transaction } from "@/types/transaction";
import { Session } from "@supabase/supabase-js";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    if (!session) return;
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
      setTransactions(transactions.filter(t => t.id !== id));
      await deleteTransaction(id);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
      loadData();
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter(t => 
      t.person_name.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const stats = useMemo(() => {
    const totalGiven = transactions
      .filter(t => t.type !== 'collection')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    const totalCollected = transactions
      .filter(t => t.type === 'collection')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const lendingTransactions = transactions.filter(t => t.type !== 'collection');
    const avgInterest = lendingTransactions.length > 0 
      ? lendingTransactions.reduce((acc, curr) => acc + Number(curr.interest), 0) / lendingTransactions.length 
      : 0;
    
    return {
      totalGiven,
      totalCollected,
      count: transactions.length,
      avgInterest: avgInterest.toFixed(1)
    };
  }, [transactions]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <SecurityLock>
      <main className="min-h-screen max-w-lg mx-auto bg-background text-white pb-24 relative">
        <Header 
          onSearch={setSearchQuery} 
          onSettings={() => setIsSettingsOpen(true)} 
        />
        
        <div className="px-4 sm:px-6 flex flex-col gap-5 sm:gap-8 mt-2 sm:mt-4">
          {/* Main Stats Card */}
          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatsCard 
                label="Total Lent" 
                value={`₹${stats.totalGiven.toLocaleString()}`} 
              />
              <StatsCard 
                label="Total Received" 
                value={`₹${stats.totalCollected.toLocaleString()}`} 
              />
            </div>
            <ChartCard transactions={transactions} />
          </section>

          {/* Mini Stats Grid */}
          <section className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-[#111113] border border-[#1A1A1D] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Transactions</span>
              <span className="text-xl sm:text-2xl font-semibold">{stats.count}</span>
            </div>
            <div className="bg-[#111113] border border-[#1A1A1D] rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Avg. Daily Interest</span>
              <span className="text-xl sm:text-2xl font-semibold">₹{stats.avgInterest}</span>
            </div>
          </section>

          {/* Recent Transactions */}
          <section>
            <TransactionList 
              transactions={filteredTransactions} 
              onDelete={handleDelete} 
              onItemClick={setSelectedTransaction}
            />
          </section>
        </div>

        <FloatingButton onClick={() => setIsModalOpen(true)} />

        
        <AddTransactionModal 
          isOpen={isModalOpen} 
          setIsOpen={setIsModalOpen} 
          onSuccess={loadData} 
        />

        <SettingsModal 
          isOpen={isSettingsOpen} 
          setIsOpen={setIsSettingsOpen} 
        />

        <TransactionDetailModal 
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />

        {(loading && session) && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-zinc-400 font-medium">Syncing with Supabase...</span>
            </div>
          </div>
        )}
      </main>
    </SecurityLock>
  );
}
