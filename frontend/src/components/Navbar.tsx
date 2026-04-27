import { motion } from 'framer-motion';
import { Droplets } from 'lucide-react';
import CurrencySelector from './CurrencySelector';

interface Props {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function Navbar({ currency, onCurrencyChange }: Props) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4"
      style={{
        background: 'linear-gradient(to bottom, rgba(10,10,10,0.98), rgba(10,10,10,0.7))',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#7C3AED] flex items-center justify-center shadow-lg">
          <Droplets size={14} className="text-white" />
        </div>
        <span className="serif text-lg font-semibold gold-text">Scent-inel</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest font-mono hidden sm:block">
          Blind Buy Intelligence
        </span>
        <CurrencySelector currency={currency} onChange={onCurrencyChange} />
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50" />
      </div>
    </motion.nav>
  );
}
