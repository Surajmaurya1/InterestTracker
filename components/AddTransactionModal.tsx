"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { addTransaction } from "@/lib/supabase";
import { NewTransaction } from "@/types/transaction";
import { INTEREST_PERIODS } from "@/lib/interest";
import { useFeedback } from "@/components/ui/feedback";

interface AddTransactionModalProps {
  onSuccess: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AddTransactionModal({ onSuccess, isOpen, setIsOpen }: AddTransactionModalProps) {
  const { showToast } = useFeedback();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<NewTransaction>({
    person_name: "",
    amount: 0,
    interest: 0,
    interest_mode: "fixed",
    interest_period: "day",
    type: "lending",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.person_name.trim();
    if (!name) {
      showToast({ tone: "error", title: "Person name required", message: "Add a name before saving this transaction." });
      return;
    }
    if (formData.amount <= 0) {
      showToast({ tone: "error", title: "Invalid amount", message: "Amount must be greater than zero." });
      return;
    }
    if (formData.type === "lending" && formData.interest < 0) {
      showToast({ tone: "error", title: "Invalid interest", message: "Interest cannot be negative." });
      return;
    }
    if (formData.type === "lending" && formData.interest_mode === "percentage" && formData.interest > 100) {
      showToast({ tone: "error", title: "Interest too high", message: "Percentage interest cannot be greater than 100%." });
      return;
    }

    setLoading(true);
    try {
      await addTransaction({ ...formData, person_name: name });
      setIsOpen(false);
      onSuccess();
      setFormData({
        person_name: "",
        amount: 0,
        interest: 0,
        interest_mode: "fixed",
        interest_period: "day",
        type: "lending",
        date: new Date().toISOString().split("T")[0],
      });
      showToast({ tone: "success", title: "Transaction added", message: "Your lending entry has been saved." });
    } catch (error) {
      console.error("Error adding transaction:", error);
      showToast({
        tone: "error",
        title: "Could not add transaction",
        message: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-[#1A1A1D] bg-[#111113] p-6 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold">New Transaction</Dialog.Title>
            <Dialog.Close className="p-2 text-zinc-400 transition-colors hover:text-white">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex rounded-2xl bg-[#1A1A1D] p-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "lending" })}
                className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  formData.type === "lending"
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Lending
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "collection", interest: 0, interest_mode: "fixed", interest_period: "day" })}
                className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  formData.type === "collection"
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Received
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-500">Person Name</label>
              <input
                required
                type="text"
                maxLength={100}
                placeholder={formData.type === "lending" ? "Who are you lending to?" : "From whom did you receive?"}
                className="rounded-2xl border border-transparent bg-[#1A1A1D] px-4 py-3 font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700"
                value={formData.person_name}
                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <label className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
                  {formData.type === "lending" ? "Amount Lent (\u20B9)" : "Amount Received (\u20B9)"}
                </label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className="rounded-2xl border border-transparent bg-[#1A1A1D] px-4 py-3 font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>

              {formData.type === "lending" && (
                <div className="flex flex-col gap-4 rounded-3xl border border-[#1A1A1D] bg-[#0D0D0F] p-4">
                  <div className="flex flex-col gap-2">
                    <label className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-500">Interest Type</label>
                    <div className="flex rounded-2xl bg-[#1A1A1D] p-1">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, interest_mode: "fixed" })}
                        className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                          formData.interest_mode !== "percentage"
                            ? "bg-white text-black shadow-lg"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        INR Amount
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, interest_mode: "percentage" })}
                        className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                          formData.interest_mode === "percentage"
                            ? "bg-white text-black shadow-lg"
                            : "text-zinc-500 hover:text-white"
                        }`}
                      >
                        Percentage
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
                      {formData.interest_mode === "percentage" ? "Interest Rate (%)" : "Interest Amount (\u20B9)"}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step={formData.interest_mode === "percentage" ? "0.01" : "1"}
                      placeholder="0"
                      className="rounded-2xl border border-transparent bg-[#1A1A1D] px-4 py-3 font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700"
                      value={formData.interest || ""}
                      onChange={(e) => setFormData({ ...formData, interest: Number(e.target.value) })}
                    />
                    <span className="px-1 text-xs text-zinc-500">
                      {formData.interest_mode === "percentage" ? "Example: 2 means 2% interest" : "Example: 500 means \u20B9500 interest"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-500">Interest Period</label>
                    <div className="grid grid-cols-3 gap-2">
                      {INTEREST_PERIODS.map((period) => (
                        <button
                          key={period}
                          type="button"
                          onClick={() => setFormData({ ...formData, interest_period: period })}
                          className={`rounded-2xl py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                            formData.interest_period === period
                              ? "bg-white text-black shadow-lg"
                              : "bg-[#1A1A1D] text-zinc-500 hover:text-white"
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="px-1 text-xs font-medium uppercase tracking-widest text-zinc-500">Date</label>
              <input
                required
                type="date"
                className="rounded-2xl border border-transparent bg-[#1A1A1D] px-4 py-3 font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-zinc-700 [color-scheme:dark]"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-2 flex h-14 items-center justify-center gap-2 rounded-2xl bg-white font-semibold text-black transition-colors hover:bg-zinc-200 disabled:opacity-50"
            >
              {loading ? "Adding..." : (
                <>
                  <Plus size={20} />
                  <span>Add Transaction</span>
                </>
              )}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
