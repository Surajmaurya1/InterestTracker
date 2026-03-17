"use client";

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
}

export default function StatsCard({ label, value, subValue }: StatsCardProps) {
  return (
    <div className="bg-[#111113] border border-[#1A1A1D] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col gap-1">
      <span className="text-[10px] sm:text-sm text-zinc-400 font-medium uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-4xl font-semibold tracking-tight">{value}</span>
        {subValue && (
          <span className="text-sm text-zinc-500">{subValue}</span>
        )}
      </div>
    </div>
  );
}
