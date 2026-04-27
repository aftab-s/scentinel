import { useState, useEffect } from 'react';
import { DollarSign, ChevronDown } from 'lucide-react';
import { getCurrencies } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  currency: string;
  onChange: (currency: string) => void;
}

export default function CurrencySelector({ currency, onChange }: Props) {
  const [currencies, setCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP']);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getCurrencies()
      .then(data => setCurrencies(data.currencies))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4AF37]/30 transition-colors text-sm font-mono text-white"
      >
        <DollarSign size={14} className="text-[#D4AF37]" />
        {currency}
        <ChevronDown size={12} className="text-white/50" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute top-full right-0 mt-2 w-32 glass rounded-xl p-2 z-20 shadow-2xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {currencies.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono transition-colors ${
                    c === currency
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  {c}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
