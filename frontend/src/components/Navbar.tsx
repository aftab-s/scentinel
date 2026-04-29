import { motion } from 'framer-motion';
import { User, Droplets } from 'lucide-react';
import CurrencySelector from './CurrencySelector';

interface Props {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function Navbar({ currency, onCurrencyChange }: Props) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <motion.nav
        className="nothing-glass px-6 py-4 flex items-center justify-between border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
        initial={{ opacity: 0, y: -20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ left: '50%', x: '-50%' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <Droplets size={16} className="text-white" />
          </div>
          <span className="dot-matrix text-xl font-bold tracking-tighter red-dot">
            Scentinel
          </span>
        </div>

        {/* Links & Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-[10px] dot-matrix font-bold tracking-[0.2em]">
            <a href="#vault" className="hover:text-red-500 transition-colors">Vault</a>
            <a href="#risk-engine" className="hover:text-red-500 transition-colors">Risk</a>
          </div>
          <div className="h-4 w-px bg-black/10" />
          <div className="flex items-center gap-4">
            <CurrencySelector currency={currency} onChange={onCurrencyChange} />
            <User size={18} className="cursor-pointer hover:text-red-500 transition-colors" />
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
