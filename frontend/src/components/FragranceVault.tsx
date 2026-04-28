import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Frown } from 'lucide-react';
import type { Fragrance, UserProfile } from '../types';
import FragranceCard from './FragranceCard';
import AddFragranceModal from './AddFragranceModal';

interface Props {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
  currency: string;
}

export default function FragranceVault({ profile, onUpdate, currency }: Props) {
  const [modal, setModal] = useState<'love' | 'hate' | null>(null);

  const addFragrance = (type: 'love' | 'hate', f: Fragrance) => {
    if (type === 'love') {
      onUpdate({ ...profile, loved: [...profile.loved, f] });
    } else {
      onUpdate({ ...profile, hated: [...profile.hated, f] });
    }
  };

  const removeFragrance = (type: 'love' | 'hate', id: string) => {
    if (type === 'love') {
      onUpdate({ ...profile, loved: profile.loved.filter(f => f.id !== id) });
    } else {
      onUpdate({ ...profile, hated: profile.hated.filter(f => f.id !== id) });
    }
  };

  return (
    <section id="vault" className="px-4 md:px-8 max-w-7xl mx-auto mb-16 mt-8">
      {/* Section header */}
      <motion.div
        className="flex flex-col items-center justify-center gap-3 mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="serif text-4xl md:text-5xl font-bold text-[#2C241B] tracking-tight">
          The Intelligence Vault
        </h2>
        <p className="text-[#4A3B32]/70 sans-serif text-sm tracking-widest uppercase">
          Curated Scent Anchors
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Loved Section */}
        <div className="bg-[#FDFBF7]/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#E8CFC1]/10 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D2A795]/10 flex items-center justify-center">
                <Heart size={16} className="text-[#D2A795]" fill="#D2A795" />
              </div>
              <div>
                <span className="block text-sm text-[#4A3B32] uppercase tracking-widest font-bold">
                  Positive Anchors
                </span>
                <span className="text-xs text-[#4A3B32]/60 sans-serif">
                  {profile.loved.length} Fragrances
                </span>
              </div>
            </div>
            <button
              onClick={() => setModal('love')}
              className="flex items-center gap-2 text-sm text-[#4A3B32] hover:text-[#2C241B] transition-all font-medium bg-white/50 hover:bg-white border border-white/50 shadow-sm px-5 py-2.5 rounded-full"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {profile.loved.length === 0 ? (
              <div className="col-span-full">
                <EmptyShelf
                  label="Add fragrances you love"
                  onClick={() => setModal('love')}
                  color="gold"
                />
              </div>
            ) : (
              profile.loved.map(f => (
                <FragranceCard
                  key={f.id}
                  fragrance={f}
                  type="love"
                  onRemove={id => removeFragrance('love', id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Hated Section */}
        <div className="bg-[#FDFBF7]/40 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 md:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.03)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-900/5 to-transparent pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/5 flex items-center justify-center">
                <Frown size={16} className="text-red-800/60" />
              </div>
              <div>
                <span className="block text-sm text-[#4A3B32] uppercase tracking-widest font-bold">
                  Negative Anchors
                </span>
                <span className="text-xs text-[#4A3B32]/60 sans-serif">
                  {profile.hated.length} Fragrances
                </span>
              </div>
            </div>
            <button
              onClick={() => setModal('hate')}
              className="flex items-center gap-2 text-sm text-[#4A3B32] hover:text-[#2C241B] transition-all font-medium bg-white/50 hover:bg-white border border-white/50 shadow-sm px-5 py-2.5 rounded-full"
            >
              <Plus size={14} />
              Add
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {profile.hated.length === 0 ? (
              <div className="col-span-full">
                <EmptyShelf
                  label="Add fragrances you avoid"
                  onClick={() => setModal('hate')}
                  color="red"
                />
              </div>
            ) : (
              profile.hated.map(f => (
                <FragranceCard
                  key={f.id}
                  fragrance={f}
                  type="hate"
                  onRemove={id => removeFragrance('hate', id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddFragranceModal
        open={modal === 'love'}
        type="love"
        onClose={() => setModal(null)}
        onAdd={f => addFragrance('love', f)}
        currency={currency}
      />
      <AddFragranceModal
        open={modal === 'hate'}
        type="hate"
        onClose={() => setModal(null)}
        onAdd={f => addFragrance('hate', f)}
        currency={currency}
      />
    </section>
  );
}

function EmptyShelf({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color: 'gold' | 'red';
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-40 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all hover:bg-white/60 hover:shadow-sm group"
    >
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ background: color === 'gold' ? 'rgba(210, 167, 149, 0.1)' : 'rgba(153, 27, 27, 0.05)' }}
      >
        <Plus size={20} style={{ color: color === 'gold' ? '#D2A795' : '#991b1b' }} />
      </div>
      <span
        className="text-xs sans-serif font-semibold text-center px-4 uppercase tracking-wider"
        style={{ color: color === 'gold' ? '#4A3B32' : '#991b1b', opacity: 0.7 }}
      >
        {label}
      </span>
    </button>
  );
}
