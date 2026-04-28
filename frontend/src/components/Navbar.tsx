import { motion } from 'framer-motion';
import { Search, ShoppingBag } from 'lucide-react';
import CurrencySelector from './CurrencySelector';

interface Props {
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function Navbar({ currency, onCurrencyChange }: Props) {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8CFC1]/30"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="sans-serif text-2xl font-bold tracking-tight text-[#2C241B]">Scentinel</span>
      </div>

      {/* Center Links (Desktop) */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4A3B32] sans-serif">
        <a href="#" className="hover:text-[#D2A795] transition-colors">About Us</a>
        <a href="#" className="hover:text-[#D2A795] transition-colors">Collections</a>
        <a href="#" className="hover:text-[#D2A795] transition-colors">Shop</a>
        <a href="#" className="hover:text-[#D2A795] transition-colors">Contact Us</a>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <CurrencySelector currency={currency} onChange={onCurrencyChange} />
        <div className="flex gap-4 ml-2 items-center text-[#4A3B32]">
          <Search size={20} className="cursor-pointer hover:text-[#D2A795] transition-colors" />
          <ShoppingBag size={20} className="cursor-pointer hover:text-[#D2A795] transition-colors" />
        </div>
      </div>
    </motion.nav>
  );
}
