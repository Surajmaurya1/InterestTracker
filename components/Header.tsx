"use client";

import { Search, Filter, Settings, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onSettings: () => void;
}

export default function Header({ onSearch, onSettings }: HeaderProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 relative h-16">
      {isSearching ? (
        <div className="absolute inset-0 px-6 flex items-center bg-background z-20 animate-in slide-in-from-top duration-200">
          <div className="flex-1 flex items-center gap-3 bg-[#111113] border border-[#1A1A1D] rounded-2xl px-4 py-2">
            <Search size={18} className="text-zinc-500" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search person..." 
              className="bg-transparent border-none outline-none flex-1 text-sm text-white placeholder:text-zinc-600"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            <button onClick={() => { setIsSearching(false); onSearch(""); setSearchQuery(""); }}>
              <X size={18} className="text-zinc-500 hover:text-white" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight">Interest Tracker</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSearching(true)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-[#111113] rounded-xl transition-all"
            >
              <Search size={20} />
            </button>
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-[#111113] rounded-xl transition-all">
              <Filter size={20} />
            </button>
            <button 
              onClick={onSettings}
              className="p-2 text-zinc-400 hover:text-white hover:bg-[#111113] rounded-xl transition-all"
            >
              <Settings size={20} />
            </button>
          </div>
        </>
      )}
    </header>
  );
}
