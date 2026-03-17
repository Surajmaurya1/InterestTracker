"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus } from "lucide-react";
import { addTransaction } from "@/lib/supabase";
import { NewTransaction } from "@/types/transaction";
import { INTEREST_PERIODS } from "@/lib/interest";

interface AddTransactionModalProps {
  onSuccess: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function AddTransactionModal({ onSuccess, isOpen, setIsOpen }: AddTransactionModalProps) {
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
      alert("Please enter a person name");
      return;
    }
    if (formData.amount <= 0) {
      alert("Amount must be greater than 0");
      return;
    }
    if (formData.type === "lending" && formData.interest < 0) {
      alert("Interest cannot be negative");
      return;
    }
    if (formData.type === "lending" && formData.interest_mode === "percentage" && formData.interest > 100) {
      alert("Interest percentage cannot be greater than 100");
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
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert(error instanceof Error ? error.message : "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-[#111113] border border-[#1A1A1D] rounded-3xl p-6 sm:p-8 z-50 animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-semibold">New Transaction</Dialog.Title>
            <Dialog.Close className="p-2 text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex bg-[#1A1A1D] p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "lending" })}
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
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
                className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  formData.type === "collection"
                    ? "bg-white text-black shadow-lg"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                Received
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest px-1">Person Name</label>
              <input
                required
                type="text"
                maxLength={100}
                placeholder={formData.type === "lending" ? "Who are you lending to?" : "From whom did you receive?"}
                className="bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl px-4 py-3 text-white placeholder:text-zinc-600 transition-all font-medium"
                value={formData.person_name}
                onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest px-1">
                  {formData.type === "lending" ? "Amount Lent (₹)" : "Amount Received (₹)"}
                </label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  className="bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl px-4 py-3 text-white placeholder:text-zinc-600 transition-all font-medium"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                />
              </div>

              {formData.type === "lending" && (
                <div className="flex flex-col gap-4 rounded-3xl border border-[#1A1A1D] bg-[#0D0D0F] p-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest px-1">Interest Type</label>
                    <div className="flex bg-[#1A1A1D] p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, interest_mode: "fixed" })}
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
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
                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
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
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest px-1">
                      {formData.interest_mode === "percentage" ? "Interest Rate (%)" : "Interest Amount (₹)"}
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step={formData.interest_mode === "percentage" ? "0.01" : "1"}
                      placeholder="0"
                      className="bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl px-4 py-3 text-white placeholder:text-zinc-600 transition-all font-medium"
                      value={formData.interest || ""}
                      onChange={(e) => setFormData({ ...formData, interest: Number(e.target.value) })}
                    />
                    <span className="px-1 text-xs text-zinc-500">
                      {formData.interest_mode === "percentage" ? "Example: 2 means 2% interest" : "Example: 500 means ₹500 interest"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest px-1">Interest Period</label>
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
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-widest px-1">Date</label>
              <input
                required
                type="date"
                className="bg-[#1A1A1D] border border-transparent focus:border-zinc-700 outline-none rounded-2xl px-4 py-3 text-white placeholder:text-zinc-600 transition-all font-medium [color-scheme:dark]"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-2 bg-white text-black font-semibold h-14 rounded-2xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
