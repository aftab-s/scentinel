import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Frown, FlaskConical } from 'lucide-react';
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
    <section className="px-4 md:px-8 max-w-6xl mx-auto mb-12">
      {/* Section header */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FlaskConical size={18} className="text-[#D4AF37]" />
        <h2 className="serif text-2xl font-semibold text-white">
          The Fragrance Vault
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#D4AF37]/30 to-transparent ml-2" />
      </motion.div>

      {/* Loved shelf */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart size={13} className="text-[#D4AF37]" fill="#D4AF37" />
            <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-mono">
              Loved ({profile.loved.length})
            </span>
          </div>
          <button
            onClick={() => setModal('love')}
            className="flex items-center gap-1.5 text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors font-mono border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 px-3 py-1.5 rounded-full"
          >
            <Plus size={11} />
            Add
          </button>
        </div>

        <div className="shelf-scroll flex gap-3 pb-3">
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Frown size={13} className="text-red-400" />
            <span className="text-xs text-red-400 uppercase tracking-widest font-mono">
              Hated ({profile.hated.length})
            </span>
          </div>
          <button
            onClick={() => setModal('hate')}
            className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 transition-colors font-mono border border-red-500/20 hover:border-red-500/50 px-3 py-1.5 rounded-full"
          >
            <Plus size={11} />
            Add
          </button>
        </div>

        <div className="shelf-scroll flex gap-3 pb-3">
          {profile.hated.length === 0 ? (
            <EmptyShelf
              label="Add fragrances you hate"
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
      className="flex-shrink-0 w-44 h-28 glass rounded-2xl flex flex-col items-center justify-center gap-2 border-dashed hover:bg-white/5 transition-colors"
      style={{
        borderColor: color === 'gold' ? 'rgba(212,175,55,0.2)' : 'rgba(239,68,68,0.2)',
      }}
    >
      <Plus size={16} style={{ color: color === 'gold' ? '#D4AF37' : '#f87171' }} />
      <span
        className="text-xs font-mono text-center px-2"
        style={{ color: color === 'gold' ? '#D4AF37' : '#f87171', opacity: 0.6 }}
      >
        {label}
      </span>
    </button>
  );
}
