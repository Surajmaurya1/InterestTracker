"use client";

import { Search, Settings, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onSettings: () => void;
}

export default function Header({ onSearch, onSettings }: HeaderProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  return (
    <header className="relative flex h-14 items-center justify-between px-4 py-3 sm:h-16 sm:px-6 sm:py-4">
      {isSearching ? (
        <div className="absolute inset-0 z-20 flex items-center bg-background px-4 sm:px-6 animate-in slide-in-from-top duration-200">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#1A1A1D] bg-[#111113] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <Search size={18} className="text-zinc-500" />
            <input
              autoFocus
              type="text"
              placeholder="Search person..."
              className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button
              type="button"
              onClick={() => {
                setIsSearching(false);
                onSearch("");
                setSearchQuery("");
              }}
              className="rounded-full p-1 text-zinc-500 transition-colors hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <h1 className="bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-xl font-bold tracking-tight text-transparent">
              Welcome Back
            </h1>
            <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-600">Track lending with clarity</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSearching(true)}
              className="rounded-xl p-2 text-zinc-400 transition-all hover:bg-[#111113] hover:text-white"
            >
              <Search size={20} />
            </button>
            <button
              type="button"
              onClick={onSettings}
              className="rounded-xl p-2 text-zinc-400 transition-all hover:bg-[#111113] hover:text-white"
            >
              <Settings size={20} />
            </button>
          </div>
        </>
      )}
    </header>
  );
}
