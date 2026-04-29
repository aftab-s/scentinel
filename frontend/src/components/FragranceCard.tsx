import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Fragrance } from '../types';

interface Props {
  fragrance: Fragrance;
  type: 'love' | 'hate';
  onRemove: (id: string) => void;
}

export default function FragranceCard({ fragrance, type, onRemove }: Props) {
  const isLove = type === 'love';

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="nothing-glass p-6 relative group glyph-hover border-black/5 shadow-sm h-full flex flex-col justify-between"
      >
        {/* Remove button */}
        <button
          onClick={() => onRemove(fragrance.id)}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg nothing-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white z-20"
        >
          <X size={12} />
        </button>

        {/* Content Layout */}
        <div className="flex flex-col items-start text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-1 h-3 rounded-full ${isLove ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="dot-matrix text-[8px] font-bold tracking-[0.3em] text-black/30 uppercase">
              {isLove ? 'AFFINITY_POS' : 'AFFINITY_NEG'}
            </span>
          </div>

          <p className="dot-matrix text-[9px] font-bold tracking-[0.2em] text-black/40 mb-1 uppercase">
            {fragrance.brand}
          </p>
          <h3 className="dot-matrix text-base font-bold text-black leading-tight mb-4 group-hover:text-red-600 transition-colors">
            {fragrance.name}
          </h3>
        </div>

        {/* Accords - Minimalist dots/list */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {fragrance.accords.slice(0, 3).map(accord => (
              <span
                key={accord}
                className="dot-matrix text-[8px] font-bold text-black/40 tracking-wider flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-black/10" />
                {accord}
              </span>
            ))}
          </div>
          
          {fragrance.price && (
            <div className="pt-4 mt-2 border-t border-black/5 flex justify-between items-center">
              <span className="dot-matrix text-[8px] font-bold tracking-[0.2em] text-black/20 italic">
                PRC_VAL
              </span>
              <span className="dot-matrix text-[9px] font-bold tracking-[0.1em] text-black/60">
                {fragrance.currency || 'USD'} {fragrance.price}
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
