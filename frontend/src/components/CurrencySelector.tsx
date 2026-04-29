import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
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
        className="flex items-center gap-3 px-5 py-2.5 rounded-xl nothing-glass border-black/5 hover:bg-black hover:text-white transition-all group"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 group-hover:bg-white transition-colors" />
        <span className="dot-matrix text-[10px] font-bold tracking-[0.2em]">{currency}</span>
        <ChevronDown size={12} className="opacity-30 group-hover:opacity-100" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute top-full right-0 mt-3 w-36 nothing-glass p-2 z-20 shadow-2xl border-black/5 overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              transition={{ duration: 0.2 }}
            >
              <div className="dot-matrix text-[8px] font-bold text-black/20 tracking-[0.3em] px-3 py-2 mb-1 border-b border-black/5">
                SELECT_VALUTA
              </div>
              {currencies.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    onChange(c);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all group/item flex items-center justify-between ${
                    c === currency
                      ? 'bg-black text-white'
                      : 'text-black/60 hover:bg-black/5'
                  }`}
                >
                  <span className="dot-matrix text-[10px] font-bold tracking-widest">{c}</span>
                  {c === currency && <div className="w-1 h-1 rounded-full bg-red-500" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
