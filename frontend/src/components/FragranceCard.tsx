import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Frown } from 'lucide-react';
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
        className="relative flex-shrink-0 w-52 glass rounded-2xl p-5 cursor-default group hover:scale-[1.02] transition-transform"
        style={{
          borderColor: type === 'love' ? 'rgba(212,175,55,0.3)' : 'rgba(239,68,68,0.25)',
          background: type === 'love' 
            ? 'linear-gradient(135deg, rgba(212,175,55,0.03), rgba(255,255,255,0.02))'
            : 'linear-gradient(135deg, rgba(239,68,68,0.03), rgba(255,255,255,0.02))',
        }}
      >
        {/* Image */}
        {fragrance.image_url && (
          <div className="mb-3 flex justify-center">
            <img
              src={fragrance.image_url}
              alt={fragrance.name}
              className="w-16 h-16 object-contain"
            />
          </div>
        )}

        {/* Type badge */}
        <div
          className="absolute top-3 left-3 w-6 h-6 rounded-full flex items-center justify-center backdrop-blur-sm"
          style={{
            background: type === 'love' ? 'rgba(212,175,55,0.2)' : 'rgba(239,68,68,0.2)',
          }}
        >
          {type === 'love' ? (
            <Heart size={11} className="text-[#D4AF37]" fill="#D4AF37" />
          ) : (
            <Frown size={11} className="text-red-400" />
          )}
        </div>

        {/* Remove button */}
        <button
          onClick={() => onRemove(fragrance.id)}
          className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 backdrop-blur-sm"
        >
          <X size={11} className="text-white/60" />
        </button>

        {/* Content */}
        <div className={fragrance.image_url ? '' : 'mt-7'}>
          <p className="text-[10px] text-[#94A3B8] uppercase tracking-[0.15em] truncate font-mono">
            {fragrance.brand}
          </p>
          <p className="text-sm font-semibold text-white mt-1 leading-tight line-clamp-2 serif">
            {fragrance.name}
          </p>
        </div>

        {/* Price */}
        {fragrance.price && (
          <p className="text-xs text-[#94A3B8]/70 mt-2 font-mono">
            {fragrance.currency || 'USD'} {fragrance.price}
          </p>
        )}

        {/* Accords */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {fragrance.accords.slice(0, 3).map(accord => (
            <span
              key={accord}
              className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-white/5 text-white/60 border border-white/10"
            >
              {accord}
            </span>
          ))}
        </div>

        {/* Shimmer overlay */}
        <div className="absolute inset-0 rounded-2xl shimmer opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}
