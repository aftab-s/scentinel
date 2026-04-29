import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets } from 'lucide-react';
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
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          type === 'hate'
            ? { opacity: 0, scale: 0.8, filter: 'blur(10px)', y: -30 }
            : { opacity: 0, scale: 0.9, y: -15 }
        }
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="nothing-glass p-5 relative group overflow-hidden glyph-hover border-black/5 shadow-[0_8px_30px_rgba(0,0,0,0.03)] h-full"
      >
        {/* Botanical Background Detail */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity duration-1000">
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-leaf-green">
            <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.13,20C11.1,20 13.82,18.06 14.65,15.18C15.54,12.1 14.28,8.83 11.64,7.03C11.1,5.5 10,4 10,4C10,4 9.17,5.5 8.76,6.32C6.11,6.58 4,8.74 4,11.38C4,12.75 4.54,14 5.42,14.93C4.84,16.32 4.41,17.75 4.14,19.23C2.81,17.15 2,14.66 2,12C2,6.48 6.48,2 12,2C17.52,2 22,6.48 22,12C22,14.66 21.19,17.15 19.86,19.23C19.59,17.75 19.16,16.32 18.58,14.93C19.46,14 20,12.75 20,11.38C20,8.74 17.89,6.58 15.24,6.32C14.83,5.5 14,4 14,4C14,4 12.9,5.5 12.36,7.03C9.72,8.83 8.46,12.1 9.35,15.18C10.18,18.06 12.9,20 15.87,20C16.36,20 16.86,19.87 17.34,19.7L18.29,22L20.18,21.34C18.1,16.17 16,10 7,8" />
          </svg>
        </div>
        {/* Remove button */}
        <button
          onClick={() => onRemove(fragrance.id)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full nothing-glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black hover:text-white"
        >
          <X size={14} />
        </button>

        {/* Content Layout */}
        <div className="flex flex-col items-center text-center h-full">
          {/* Image/Icon Widget */}
          <div className="w-16 h-16 rounded-[20px] bg-black/[0.03] flex items-center justify-center mb-4 overflow-hidden relative">
            {fragrance.image_url ? (
              <img
                src={fragrance.image_url}
                alt={fragrance.name}
                className="w-10 h-10 object-contain grayscale group-hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              <Droplets size={24} className="text-black/10" />
            )}
            <div className="absolute inset-0 bg-black/5 group-hover:opacity-0 transition-opacity" />
          </div>

          <p className="dot-matrix text-[8px] font-bold tracking-[0.3em] text-black/40 mb-1 uppercase">
            {fragrance.brand}
          </p>
          <h3 className="dot-matrix text-sm font-bold text-black leading-tight line-clamp-2 mb-2">
            {fragrance.name}
          </h3>

          <div className="flex items-center gap-2 mb-4">
            <div className={`w-1.5 h-1.5 rounded-full ${isLove ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="dot-matrix text-[8px] font-bold tracking-widest text-black/40">
              {isLove ? 'AFFINITY_POS' : 'AFFINITY_NEG'}
            </span>
          </div>

          {/* Accords */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-auto">
            {fragrance.accords.slice(0, 3).map(accord => (
              <span
                key={accord}
                className="dot-matrix text-[7px] px-2 py-1 rounded-full bg-black/[0.03] text-black/50 border border-black/5"
              >
                {accord}
              </span>
            ))}
            {fragrance.accords.length > 3 && (
              <span className="dot-matrix text-[7px] text-black/20 italic self-center">
                +{fragrance.accords.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Technical Detail */}
        {fragrance.price && (
          <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="dot-matrix text-[7px] font-bold tracking-[0.2em] text-black/30">
              {fragrance.currency || 'USD'}_{fragrance.price}
            </span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
