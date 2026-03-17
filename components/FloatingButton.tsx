import { Plus } from "lucide-react";

interface FloatingButtonProps {
  onClick: () => void;
}

export default function FloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group"
    >
      <Plus size={32} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
}
