"use client";

import { useMemo, useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip, CartesianGrid } from "recharts";
import { Transaction } from "@/types/transaction";
import { format, parseISO, subDays, isSameDay } from "date-fns";

interface ChartCardProps {
  transactions: Transaction[];
}

export default function ChartCard({ transactions }: ChartCardProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Generate last 7 days to ensure chart always has data points
  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    
    return days.map(day => {
      const dayStr = format(day, "MMM dd");
      const total = transactions.reduce((acc, curr) => {
        if (isSameDay(parseISO(curr.date), day)) {
          return acc + Number(curr.amount);
        }
        return acc;
      }, 0);
      
      return {
        date: dayStr,
        amount: total
      };
    });
  }, [transactions]);

  if (!isMounted) {
    return (
      <div className="bg-[#111113] border border-[#1A1A1D] rounded-3xl p-6 h-[280px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/5 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#111113] border border-[#1A1A1D] rounded-3xl p-6 h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Lending Activity</h3>
        <span className="text-[10px] text-zinc-600 font-medium">Last 7 Days</span>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#1A1A1D" strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#52525b', fontSize: 10, fontWeight: 500 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#52525b', fontSize: 10, fontWeight: 500 }}
              tickFormatter={(value) => `₹${value > 999 ? (value/1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              contentStyle={{ 
                backgroundColor: '#111113', 
                border: '1px solid #1A1A1D', 
                borderRadius: '12px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff', fontWeight: 'bold' }}
              formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
              labelStyle={{ color: '#71717a', marginBottom: '4px' }}
            />
            <Bar dataKey="amount" radius={[4, 4, 4, 4]} barSize={24}>
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
