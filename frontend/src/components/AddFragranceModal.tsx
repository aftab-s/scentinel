import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
    
    reset();
    onClose();
  };

  const reset = () => {
    setSearchQuery('');
    setBrand('');
    setName('');
    setPrice('');
    setAccords([]);
    setNotes(null);
    setImageUrl('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isLove = type === 'love';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-white/60 backdrop-blur-xl z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div
              className="nothing-glass border-black/10 p-8 w-full max-w-lg relative shadow-[0_32px_80px_rgba(0,0,0,0.1)] pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLove ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <h2 className="dot-matrix text-xl font-bold text-black uppercase tracking-tight">
                      Add_To_Collection
                    </h2>
                    <span className="dot-matrix text-[9px] font-bold text-black/30 tracking-[0.2em] uppercase">
                      Specify preferences
                    </span>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="dot-matrix text-[10px] font-bold text-black/40 hover:text-black transition-colors uppercase"
                >
                  Close
                </button>
              </div>

              {/* Search bar */}
              <div className="mb-8">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-5 py-4 dot-matrix text-sm text-black placeholder-black/40 focus:ring-2 focus:ring-black/10 transition-all outline-none"
                      placeholder="Fragrance name..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    className="px-6 py-4 rounded-xl dot-matrix text-[10px] tracking-[0.2em] font-bold transition-all bg-black text-white hover:bg-red-600 disabled:bg-black/40 disabled:text-white/40 active:scale-[0.98] uppercase"
                  >
                    {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                  </button>
                </div>
                {error && (
                  <p className="dot-matrix text-[9px] text-red-500 font-bold tracking-widest mt-3 px-2">{error}</p>
                )}
              </div>

              {/* Details */}
              <AnimatePresence mode="wait">
                {brand && name ? (
                  <motion.div
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(10px)' }}
                    className="space-y-6"
                  >
                    {/* Source & Image */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-black/[0.02] border border-black/5">
                      <div className="flex-1">
                         <span className="dot-matrix text-[8px] px-2 py-1 rounded-full bg-black text-white tracking-widest font-bold mb-2 inline-block">
                          {source.toUpperCase()}
                        </span>
                        <h3 className="dot-matrix text-sm font-bold truncate mb-1">{name}</h3>
                        <p className="dot-matrix text-[9px] text-black/40 font-bold tracking-widest">{brand}</p>
                      </div>
                      <div className="w-16 h-16 rounded-md bg-white border border-black/5 flex items-center justify-center p-2">
                        {imageUrl ? (
                          <img src={imageUrl} alt={name} className="w-full h-full object-contain grayscale" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="dot-matrix text-[8px] text-black/40 tracking-[0.2em] mb-2 font-bold uppercase">Brand</p>
                        <input
                          className="w-full bg-black/5 border-none rounded-xl px-4 py-3 dot-matrix text-xs text-black"
                          value={brand}
                          onChange={e => setBrand(e.target.value)}
                        />
                      </div>
                      <div>
                        <p className="dot-matrix text-[8px] text-black/40 tracking-[0.2em] mb-2 font-bold uppercase">Name</p>
                        <input
                          className="w-full bg-black/5 border-none rounded-xl px-4 py-3 dot-matrix text-xs text-black"
                          value={name}
                          onChange={e => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Accords */}
                    <div>
                      <p className="dot-matrix text-[8px] text-black/40 tracking-[0.2em] mb-3 font-bold uppercase">Scent Profile</p>
                      <div className="flex flex-wrap gap-2">
                        {accords.map(accord => (
                          <span
                            key={accord}
                            className="dot-matrix text-[8px] px-2.5 py-1.5 rounded-full bg-black/[0.03] text-black/50 border border-black/5 font-bold"
                          >
                            {accord}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div>
                      <p className="dot-matrix text-[8px] text-black/40 tracking-[0.2em] mb-2 font-bold uppercase">Retail_Price ({currency})</p>
                      <input
                        className="w-full bg-black/5 border-none rounded-xl px-5 py-4 dot-matrix text-sm text-black placeholder-black/20 focus:ring-2 focus:ring-black/5 transition-all"
                        placeholder="Valuation..."
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      className={`w-full py-5 rounded-xl dot-matrix text-[11px] tracking-[0.4em] font-bold transition-all shadow-lg text-white uppercase ${isLove ? 'bg-black hover:bg-green-600' : 'bg-black hover:bg-red-600'}`}
                    >
                      Add_To_Collection
                    </button>
                  </motion.div>
                ) : !searching && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 flex flex-col items-center justify-center border border-dashed border-black/10 rounded-xl"
                  >
                    <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mb-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-black/10" />
                    </div>
                    <p className="dot-matrix text-black/30 text-[9px] tracking-[0.2em] font-bold uppercase">
                      Enter a name above
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
