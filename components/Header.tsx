import { Search, Filter, Settings, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2 bg-[#111113] border border-[#1A1A1D] px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#1A1A1D] transition-colors">
        <span className="text-sm font-medium">Lending</span>
        <ChevronDown size={14} className="text-zinc-400" />
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Filter size={20} />
        </button>
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
