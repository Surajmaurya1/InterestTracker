"use client";

import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid } from "recharts";
import { Transaction } from "@/types/transaction";
import { format, parseISO, subDays, isAfter } from "date-fns";
import { formatCurrency, getMonthlyInterestProjection } from "@/lib/interest";

interface ChartCardProps {
  transactions: Transaction[];
}

function formatAxisCurrency(value: number): string {
  if (value >= 1000) {
    const compact = value >= 10000 ? (value / 1000).toFixed(0) : (value / 1000).toFixed(1);
    return `\u20B9${compact.replace(".0", "")}k`;
  }

  return `\u20B9${Math.round(value)}`;
}

export default function ChartCard({ transactions }: ChartCardProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    const lendingTransactions = transactions.filter((transaction) => transaction.type !== "collection");

    return days.map((day) => {
      const total = lendingTransactions.reduce((acc, transaction) => {
        const transactionDate = parseISO(transaction.date);
        if (isAfter(transactionDate, day)) return acc;
        return acc + getMonthlyInterestProjection(transaction);
      }, 0);

      return {
        date: format(day, "MMM dd"),
        amount: total,
      };
    });
  }, [transactions]);

  if (!isMounted) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-3xl border border-[#1A1A1D] bg-[#111113] p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-white" />
      </div>
    );
  }

  return (
    <div className="h-[220px] rounded-2xl border border-[#1A1A1D] bg-[#111113] p-4 sm:h-[280px] sm:rounded-3xl sm:p-6">
      <div className="mb-3 flex items-center justify-between sm:mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Monthly Interest Run Rate</h3>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-zinc-600">Active lending positions over time</p>
        </div>
        <span className="text-[10px] font-medium text-zinc-600">Last 7 Days</span>
      </div>

      <div className="h-[150px] w-full sm:h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#1A1A1D" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#52525b", fontSize: 10, fontWeight: 500 }}
              tickFormatter={(value) => formatAxisCurrency(Number(value))}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                backgroundColor: "#111113",
                border: "1px solid #1A1A1D",
                borderRadius: "12px",
                fontSize: "12px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff", fontWeight: "bold" }}
              formatter={(value) => [formatCurrency(Number(value ?? 0)), "Monthly interest"]}
              labelStyle={{ color: "#71717a", marginBottom: "4px" }}
            />
            <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.amount > 0 ? "#FFFFFF" : "#1A1A1D"}
                  fillOpacity={entry.amount > 0 ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
