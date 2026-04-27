import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader2, Sparkles } from 'lucide-react';
import type { Fragrance } from '../types';
import { searchFragrance } from '../api';

interface Props {
  open: boolean;
  type: 'love' | 'hate';
  onClose: () => void;
  onAdd: (f: Fragrance) => void;
  currency: string;
}

export default function AddFragranceModal({ open, type, onClose, onAdd, currency }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [accords, setAccords] = useState<string[]>([]);
  const [notes, setNotes] = useState<{ top: string[]; middle: string[]; base: string[] } | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setError('');
    
    try {
      const result = await searchFragrance(searchQuery);
      setBrand(result.brand);
      setName(result.name);
      setAccords(result.accords);
      setNotes(result.notes);
      setImageUrl(result.image_url || '');
    } catch (err: any) {
      setError(err.message || 'Fragrance not found. Try a different search.');
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = () => {
    if (!brand.trim() || !name.trim() || accords.length === 0) return;
    
    onAdd({
      id: `${Date.now()}-${Math.random()}`,
      brand: brand.trim(),
      name: name.trim(),
      accords,
      price: price ? parseFloat(price) : undefined,
      currency,
      notes: notes || undefined,
      image_url: imageUrl || undefined,
    });
    
    // Reset
    setSearchQuery('');
    setBrand('');
    setName('');
    setPrice('');
    setAccords([]);
    setNotes(null);
    setImageUrl('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    setBrand('');
    setName('');
    setPrice('');
    setAccords([]);
    setNotes(null);
    setImageUrl('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div
              className="glass rounded-3xl p-8 w-full max-w-lg relative shadow-2xl"
              style={{
                borderColor: type === 'love' ? 'rgba(212,175,55,0.4)' : 'rgba(239,68,68,0.4)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className={type === 'love' ? 'text-[#D4AF37]' : 'text-red-400'} />
                  <h2 className="serif text-2xl font-semibold">
                    Add to{' '}
                    <span className={type === 'love' ? 'gold-text' : 'text-red-400'}>
                      {type === 'love' ? 'Loved' : 'Hated'}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={16} className="text-white/60" />
                </button>
              </div>

              {/* Search bar */}
              <div className="mb-6">
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-2 font-mono">
                  Search Fragrance
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors font-mono"
                      placeholder="e.g. Creed Aventus"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    className="px-5 py-3 rounded-xl font-mono text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                      color: '#fff',
                    }}
                  >
                    {searching ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-red-400 mt-2 font-mono">{error}</p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

              {/* Details */}
              {brand && name && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Image preview */}
                  {imageUrl && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="w-24 h-24 object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Brand & Name */}
                  <div>
                    <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">Brand</p>
                    <p className="text-white font-semibold serif text-lg">{brand}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">Name</p>
                    <p className="text-white font-semibold serif text-lg">{name}</p>
                  </div>

                  {/* Accords */}
                  {accords.length > 0 && (
                    <div>
                      <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-2 font-mono">Accords</p>
                      <div className="flex flex-wrap gap-2">
                        {accords.map(accord => (
                          <span
                            key={accord}
                            className="text-xs px-3 py-1.5 rounded-full font-mono bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA]"
                          >
                            {accord}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {notes && (
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {(['top', 'middle', 'base'] as const).map(layer => (
                        <div key={layer}>
                          <p className="text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">{layer}</p>
                          <div className="space-y-0.5">
                            {notes[layer].slice(0, 3).map(note => (
                              <p key={note} className="text-white/70 font-mono text-[10px]">{note}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div>
                    <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">
                      Price ({currency}) — Optional
                    </p>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors font-mono"
                      placeholder="e.g. 320"
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    className="mt-4 w-full py-3.5 rounded-xl font-mono text-sm font-semibold transition-all"
                    style={{
                      background:
                        type === 'love'
                          ? 'linear-gradient(135deg, #D4AF37, #F0D060)'
                          : 'linear-gradient(135deg, #ef4444, #f87171)',
                      color: '#0A0A0A',
                    }}
                  >
                    Add to Collection
                  </button>
                </motion.div>
              )}

              {!brand && !name && !searching && (
                <p className="text-center text-[#94A3B8]/60 text-sm font-mono">
                  Search for a fragrance to get started
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
