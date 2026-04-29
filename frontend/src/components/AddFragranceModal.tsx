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
  const [source, setSource] = useState<string>('');
  
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [accords, setAccords] = useState<string[]>([]);
  const [notes, setNotes] = useState<{ top: string[]; middle: string[]; base: string[] } | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [manualEdit, setManualEdit] = useState(false);

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
      setSource(result.source || 'unknown');
      setManualEdit(result.source === 'fallback');  // Allow editing if fallback
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
            className="fixed inset-0 bg-[#FDFBF7]/80 backdrop-blur-md z-40"
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
              className="bg-[#FDFBF7] border rounded-3xl p-8 w-full max-w-lg relative shadow-xl"
              style={{
                borderColor: type === 'love' ? 'rgba(210, 167, 149, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className={type === 'love' ? 'text-[#D2A795]' : 'text-red-800/60'} />
                  <h2 className="serif text-2xl font-semibold text-[#2C241B]">
                    Add to{' '}
                    <span className={type === 'love' ? 'text-[#D2A795]' : 'text-red-800/60'}>
                      {type === 'love' ? 'Loved' : 'Hated'}
                    </span>
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full bg-[#E8CFC1]/20 flex items-center justify-center hover:bg-[#E8CFC1]/50 transition-colors"
                >
                  <X size={16} className="text-[#4A3B32]" />
                </button>
              </div>

              {/* Search bar */}
              <div className="mb-6">
                <p className="text-xs text-[#4A3B32] uppercase tracking-widest mb-2 font-semibold">
                  Search Fragrance
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4A3B32]/50" />
                    <input
                      className="w-full bg-[#FDFBF7] border border-[#E8CFC1] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2C241B] placeholder-[#4A3B32]/40 focus:outline-none focus:border-[#D2A795] transition-colors sans-serif"
                      placeholder="e.g. Creed Aventus"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    className="px-5 py-3 rounded-xl sans-serif text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 bg-[#4A3B32] text-[#FDFBF7] hover:bg-[#2C241B]"
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
                  <p className="text-xs text-red-800/80 mt-2 sans-serif px-2">{error}</p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E8CFC1]/50 mb-6" />

              {/* Details */}
              {brand && name && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Source indicator */}
                  {source && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] px-2 py-1 rounded-full uppercase tracking-wider font-semibold bg-[#E8CFC1]/30 text-[#4A3B32]">
                        {source === 'groq' && '✓ AI Database'}
                        {(source === 'web_search' || source === 'web_scrape') && '🌐 Web Search'}
                        {source === 'fallback' && '⚠️ Manual Parse'}
                      </span>
                      {source === 'fallback' && (
                        <span className="text-[9px] text-[#D2A795] uppercase tracking-wider font-semibold">
                          Please verify details
                        </span>
                      )}
                    </div>
                  )}
                  {/* Image preview */}
                  {imageUrl && (
                    <div className="flex justify-center mb-4">
                      <img
                        src={imageUrl}
                        alt={name}
                        className="w-24 h-24 object-contain rounded-xl mix-blend-multiply"
                      />
                    </div>
                  )}

                  {/* Brand & Name */}
                  <div>
                    <p className="text-xs text-[#D2A795] uppercase tracking-widest mb-1 sans-serif font-bold">Brand</p>
                    {manualEdit ? (
                      <input
                        className="w-full bg-[#FDFBF7] border border-[#E8CFC1] rounded-lg px-3 py-2 text-sm text-[#2C241B] font-semibold serif focus:outline-none focus:border-[#D2A795]"
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                      />
                    ) : (
                      <p className="text-[#2C241B] font-bold serif text-lg">{brand}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-[#D2A795] uppercase tracking-widest mb-1 sans-serif font-bold">Name</p>
                    {manualEdit ? (
                      <input
                        className="w-full bg-[#FDFBF7] border border-[#E8CFC1] rounded-lg px-3 py-2 text-sm text-[#2C241B] font-semibold serif focus:outline-none focus:border-[#D2A795]"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    ) : (
                      <p className="text-[#2C241B] font-bold serif text-lg">{name}</p>
                    )}
                  </div>
                  
                  {/* Edit toggle for non-Tier-1 results */}
                  {source && source !== 'groq' && !manualEdit && (
                    <button
                      onClick={() => setManualEdit(true)}
                      className="text-xs text-[#D2A795] hover:text-[#C19482] transition-colors sans-serif font-semibold flex items-center gap-1"
                    >
                      ✏️ Edit details
                    </button>
                  )}

                  {/* Accords */}
                  {accords.length > 0 && (
                    <div>
                      <p className="text-xs text-[#4A3B32] uppercase tracking-widest mb-2 font-semibold">Accords</p>
                      <div className="flex flex-wrap gap-2">
                        {accords.map(accord => (
                          <span
                            key={accord}
                            className="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold bg-[#E8CFC1]/30 text-[#4A3B32]"
                          >
                            {accord}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {notes && (
                    <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-[#E8CFC1]/30">
                      {(['top', 'middle', 'base'] as const).map(layer => (
                        <div key={layer}>
                          <p className="text-[#D2A795] uppercase tracking-widest mb-1 font-bold">{layer}</p>
                          <div className="space-y-0.5">
                            {notes[layer].slice(0, 3).map(note => (
                              <p key={note} className="text-[#4A3B32] sans-serif italic text-[11px]">{note}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  <div className="pt-4 border-t border-[#E8CFC1]/30">
                    <p className="text-xs text-[#4A3B32] uppercase tracking-widest mb-1 font-semibold">
                      Price ({currency}) — Optional
                    </p>
                    <input
                      className="w-full bg-[#FDFBF7] border border-[#E8CFC1] rounded-xl px-4 py-2.5 text-sm text-[#2C241B] placeholder-[#4A3B32]/40 focus:outline-none focus:border-[#D2A795] transition-colors sans-serif"
                      placeholder="e.g. 320"
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    className="mt-4 w-full py-4 rounded-xl sans-serif text-sm font-semibold transition-all shadow-sm"
                    style={{
                      background: type === 'love' ? '#D2A795' : '#991b1b',
                      color: '#FDFBF7',
                    }}
                  >
                    Add to Collection
                  </button>
                </motion.div>
              )}

              {!brand && !name && !searching && (
                <p className="text-center text-[#4A3B32]/70 text-sm sans-serif italic py-4">
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
