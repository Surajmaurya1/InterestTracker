"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { Transaction } from "@/types/transaction";
import { format, parseISO } from "date-fns";

interface ChartCardProps {
  transactions: Transaction[];
}

export default function ChartCard({ transactions }: ChartCardProps) {
  // Group transactions by date for the chart
  const chartData = transactions.reduce((acc: any[], curr) => {
    const date = format(parseISO(curr.date), "MMM dd");
    const existing = acc.find((item) => item.date === date);
    if (existing) {
      existing.amount += Number(curr.amount);
    } else {
      acc.push({ date, amount: Number(curr.amount) });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-7);

  return (
    <div className="bg-[#111113] border border-[#1A1A1D] rounded-3xl p-6 h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#71717a', fontSize: 12 }}
            dy={10}
          />
          <Bar dataKey="amount" radius={[6, 6, 6, 6]} barSize={32}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#E5E5E5" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
