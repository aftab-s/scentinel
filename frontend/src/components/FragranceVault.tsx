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
    <section id="vault" className="px-4 md:px-8 max-w-6xl mx-auto mb-12">
      {/* Section header */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="serif text-3xl md:text-4xl font-bold text-[#2C241B]">
          The Fragrance Vault
        </h2>
        <div className="flex-1 h-px bg-[#E8CFC1]/50 ml-4" />
      </motion.div>

      {/* Loved shelf */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-[#D2A795]" fill="#D2A795" />
            <span className="text-xs text-[#4A3B32] uppercase tracking-widest font-semibold">
              Loved Collection ({profile.loved.length})
            </span>
          </div>
          <button
            onClick={() => setModal('love')}
            className="flex items-center gap-1.5 text-xs text-[#4A3B32] hover:text-[#2C241B] transition-colors font-medium bg-[#E8CFC1]/20 hover:bg-[#E8CFC1]/40 px-4 py-2 rounded-full"
          >
            <Plus size={12} />
            Add Fragrance
          </button>
        </div>

        <div className="shelf-scroll flex gap-4 pb-4">
          {profile.loved.length === 0 ? (
            <EmptyShelf
              label="Add fragrances you love"
              onClick={() => setModal('love')}
              color="gold"
            />
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

      {/* Hated shelf */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Frown size={14} className="text-red-800/60" />
            <span className="text-xs text-[#4A3B32] uppercase tracking-widest font-semibold">
              Avoided Collection ({profile.hated.length})
            </span>
          </div>
          <button
            onClick={() => setModal('hate')}
            className="flex items-center gap-1.5 text-xs text-[#4A3B32] hover:text-[#2C241B] transition-colors font-medium bg-[#E8CFC1]/20 hover:bg-[#E8CFC1]/40 px-4 py-2 rounded-full"
          >
            <Plus size={12} />
            Add Fragrance
          </button>
        </div>

        <div className="shelf-scroll flex gap-4 pb-4">
          {profile.hated.length === 0 ? (
            <EmptyShelf
              label="Add fragrances you avoid"
              onClick={() => setModal('hate')}
              color="red"
            />
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
      className="flex-shrink-0 w-52 h-32 bg-[#FDFBF7] border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors hover:bg-[#F4EFE6]"
      style={{
        borderColor: color === 'gold' ? 'rgba(210, 167, 149, 0.4)' : 'rgba(239, 68, 68, 0.2)',
      }}
    >
      <Plus size={18} style={{ color: color === 'gold' ? '#D2A795' : '#991b1b' }} />
      <span
        className="text-xs sans-serif font-medium text-center px-4"
        style={{ color: color === 'gold' ? '#4A3B32' : '#991b1b', opacity: 0.8 }}
      >
        {label}
      </span>
    </button>
  );
}
