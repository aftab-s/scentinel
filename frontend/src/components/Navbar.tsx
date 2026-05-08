import { motion } from 'framer-motion';
import CurrencySelector from './CurrencySelector';

interface Props {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function Navbar({ currency, onCurrencyChange }: Props) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <motion.nav
        className="nothing-glass px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex items-center">
          <span className="font-sora text-lg md:text-2xl font-medium tracking-tighter red-dot">
            Scentinel
          </span>
        </div>

        {/* Links & Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-[10px] dot-matrix font-bold tracking-[0.2em]">
            <a href="#vault" className="hover:text-red-500 transition-colors uppercase">Collection</a>
            <a href="#risk-engine" className="hover:text-red-500 transition-colors uppercase">Intelligence</a>
          </div>
          <div className="hidden md:block h-4 w-px bg-black/10" />
          <div className="flex items-center gap-3 md:gap-4">
            <CurrencySelector currency={currency} onChange={onCurrencyChange} />
          </div>
        </div>
      </motion.nav>
    </div>
  );
}
