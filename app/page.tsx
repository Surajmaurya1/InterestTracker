"use client";

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import ChartCard from "@/components/ChartCard";
import TransactionList from "@/components/TransactionList";
import FloatingButton from "@/components/FloatingButton";
import SecurityLock from "@/components/SecurityLock";
import Auth from "@/components/Auth";
import { supabase, fetchTransactions, deleteTransaction } from "@/lib/supabase";
import { Transaction } from "@/types/transaction";
import { Session } from "@supabase/supabase-js";
import { formatCurrency, getMonthlyInterestProjection } from "@/lib/interest";
import { useFeedback } from "@/components/ui/feedback";

const AddTransactionModal = lazy(() => import("@/components/AddTransactionModal"));
const SettingsModal = lazy(() => import("@/components/SettingsModal"));
const TransactionDetailModal = lazy(() => import("@/components/TransactionDetailModal"));

export default function Home() {
  const { showToast, confirm } = useFeedback();
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!session) return;

    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      showToast({
        tone: "error",
        title: "Could not sync transactions",
        message: "Please refresh or try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  }, [session, showToast]);

  const handleDelete = useCallback(async (id: string) => {
    const approved = await confirm({
      title: "Delete this transaction?",
      message: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!approved) return;

    const previous = transactions;
    setTransactions((current) => current.filter((item) => item.id !== id));

    try {
      await deleteTransaction(id);
      showToast({ tone: "success", title: "Transaction deleted" });
    } catch (error) {
      console.error("Error deleting transaction:", error);
      setTransactions(previous);
      showToast({
        tone: "error",
        title: "Delete failed",
        message: "The transaction could not be removed.",
      });
    }
  }, [confirm, showToast, transactions]);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, loadData]);

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return transactions;
    return transactions.filter((transaction) =>
      transaction.person_name.toLowerCase().includes(query),
    );
  }, [transactions, searchQuery]);

  const stats = useMemo(() => {
    const lendingTx = transactions.filter((transaction) => transaction.type !== "collection");
    const collectionTx = transactions.filter((transaction) => transaction.type === "collection");

    const totalGiven = lendingTx.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalCollected = collectionTx.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalMonthlyInterest = lendingTx.reduce(
      (acc, curr) => acc + getMonthlyInterestProjection(curr),
      0,
    );

    return {
      totalGiven,
      totalCollected,
      count: transactions.length,
      totalMonthlyInterest: formatCurrency(Number(totalMonthlyInterest.toFixed(2))),
    };
  }, [transactions]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <SecurityLock>
      <main className="relative mx-auto min-h-screen max-w-lg bg-background pb-24 text-white">
        <Header
          onSearch={setSearchQuery}
          onSettings={() => setIsSettingsOpen(true)}
        />

        <div className="mt-2 flex flex-col gap-5 px-4 sm:mt-4 sm:gap-8 sm:px-6">
          <section className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <StatsCard label="Total Lent" value={formatCurrency(stats.totalGiven)} />
              <StatsCard label="Total Received" value={formatCurrency(stats.totalCollected)} />
            </div>
            <ChartCard transactions={transactions} />
          </section>

          <section className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-[#1A1A1D] bg-[#111113] p-4 sm:rounded-3xl sm:p-5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Transactions</span>
              <div className="mt-1 text-xl font-semibold sm:text-2xl">{stats.count}</div>
            </div>
            <div className="rounded-2xl border border-[#1A1A1D] bg-[#111113] p-4 sm:rounded-3xl sm:p-5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Total Monthly Interest</span>
              <div className="mt-1 text-xl font-semibold sm:text-2xl">{stats.totalMonthlyInterest}</div>
            </div>
          </section>

          <section>
            <TransactionList
              transactions={filteredTransactions}
              onDelete={handleDelete}
              onItemClick={setSelectedTransaction}
            />
          </section>

          <footer className="mt-2 py-4 text-center">
            <p className="text-[11px] font-medium text-zinc-600">
              Built by{" "}
              <a
                href="https://www.linkedin.com/in/suraj-maurya-33a91325a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 decoration-zinc-700 transition-colors hover:text-white"
              >
                Suraj Maurya
              </a>
            </p>
          </footer>
        </div>

        <FloatingButton onClick={() => setIsModalOpen(true)} />

        <Suspense fallback={null}>
          {isModalOpen && (
            <AddTransactionModal
              isOpen={isModalOpen}
              setIsOpen={setIsModalOpen}
              onSuccess={loadData}
            />
          )}

          {isSettingsOpen && (
            <SettingsModal
              isOpen={isSettingsOpen}
              setIsOpen={setIsSettingsOpen}
            />
          )}

          {selectedTransaction && (
            <TransactionDetailModal
              transaction={selectedTransaction}
              isOpen={!!selectedTransaction}
              onClose={() => setSelectedTransaction(null)}
              onDelete={handleDelete}
            />
          )}
        </Suspense>

        {loading && session && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              <span className="font-medium text-zinc-400">Syncing with Supabase...</span>
            </div>
          </div>
        )}
      </main>
    </SecurityLock>
  );
}
