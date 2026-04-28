import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import CurrencySelector from './CurrencySelector';

interface Props {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function Navbar({ currency, onCurrencyChange }: Props) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 bg-[#FDFBF7]/60 backdrop-blur-xl border-b border-white/40 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="serif text-2xl font-bold tracking-tight text-[#2C241B]">Scentinel</span>
      </div>

      {/* Center Links (Desktop) */}
      <div className="hidden md:flex items-center gap-10 text-sm font-medium text-[#4A3B32]/80 sans-serif tracking-wide">
        <a href="#" className="hover:text-[#D2A795] transition-colors">Dashboard</a>
        <a href="#vault" className="hover:text-[#D2A795] transition-colors">My Vault</a>
        <a href="#risk-engine" className="hover:text-[#D2A795] transition-colors">Risk Intelligence</a>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        <CurrencySelector currency={currency} onChange={onCurrencyChange} />
        <div className="w-px h-4 bg-[#E8CFC1]/50 hidden md:block" />
        <div className="flex gap-4 items-center text-[#4A3B32]">
          <User size={18} className="cursor-pointer hover:text-[#D2A795] transition-colors" />
        </div>
      </div>
    </motion.nav>
  );
}
