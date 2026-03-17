"use client";

import { Plus } from "lucide-react";

interface FloatingButtonProps {
  onClick: () => void;
}

export default function FloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group"
    >
      <Plus size={28} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
}
