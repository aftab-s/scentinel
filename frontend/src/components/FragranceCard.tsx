import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Fragrance } from '../types';

interface Props {
  fragrance: Fragrance;
  type: 'love' | 'hate';
  onRemove: (id: string) => void;
}

export default function FragranceCard({ fragrance, type, onRemove }: Props) {
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
        className="relative w-full bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-5 cursor-default group hover:-translate-y-1 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] overflow-hidden"
        style={{
          borderColor: type === 'love' ? 'rgba(210, 167, 149, 0.3)' : 'rgba(239, 68, 68, 0.15)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: type === 'love' 
              ? 'radial-gradient(circle at top right, rgba(210,167,149,0.08), transparent 70%)'
              : 'radial-gradient(circle at top right, rgba(153,27,27,0.05), transparent 70%)'
          }}
        />

        {/* Image */}
        {fragrance.image_url && (
          <div className="mb-4 flex justify-center">
            <img
              src={fragrance.image_url}
              alt={fragrance.name}
              className="w-14 h-14 object-contain mix-blend-multiply opacity-90 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}

        {/* Type indicator (subtle line instead of badge) */}
        <div
          className="absolute top-0 left-0 w-full h-1 opacity-50"
          style={{
            background: type === 'love' 
              ? 'linear-gradient(90deg, rgba(210, 167, 149, 0.8), transparent)' 
              : 'linear-gradient(90deg, rgba(153, 27, 27, 0.4), transparent)',
          }}
        />

        {/* Remove button */}
        <button
          onClick={() => onRemove(fragrance.id)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/50 border border-white/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 shadow-sm"
        >
          <X size={12} className="text-[#4A3B32]" />
        </button>

        {/* Content */}
        <div className={fragrance.image_url ? 'text-center' : 'mt-4 text-center'}>
          <p className="text-[10px] text-[#D2A795] uppercase tracking-[0.2em] truncate sans-serif font-bold mb-1">
            {fragrance.brand}
          </p>
          <p className="text-sm font-bold text-[#2C241B] leading-tight line-clamp-2 serif">
            {fragrance.name}
          </p>
        </div>

        {/* Price */}
        {fragrance.price && (
          <p className="text-[11px] text-[#4A3B32]/60 mt-2 text-center sans-serif tracking-wide">
            {fragrance.currency || 'USD'} {fragrance.price}
          </p>
        )}

        {/* Accords */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-4">
          {fragrance.accords.slice(0, 3).map(accord => (
            <span
              key={accord}
              className="text-[9px] px-2.5 py-1 rounded-full sans-serif font-medium bg-[#E8CFC1]/20 text-[#4A3B32] border border-[#E8CFC1]/30 backdrop-blur-sm"
            >
              {accord}
            </span>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
