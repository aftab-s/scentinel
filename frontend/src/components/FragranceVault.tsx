import { useState } from 'react';
import { motion } from 'framer-motion';
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
    <section id="vault" className="px-4 md:px-8 max-w-7xl mx-auto mb-24 mt-12">
      {/* Section header */}
      <motion.div
        className="flex flex-col items-center justify-center gap-4 mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="dot-matrix text-4xl md:text-5xl font-bold text-black tracking-tight uppercase">
          Your_Collection
        </h2>
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-black/10" />
          <p className="text-black/60 dot-matrix text-[10px] tracking-[0.4em] font-bold uppercase">
            Curated Scent Preferences
          </p>
          <div className="h-px w-8 bg-black/10" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Loved Section */}
        <div className="nothing-glass p-8 border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <div>
                <span className="block dot-matrix text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  Love_List
                </span>
                <span className="dot-matrix text-xs font-bold text-black uppercase">
                  {profile.loved.length} Entries
                </span>
              </div>
            </div>
            <button
              onClick={() => setModal('love')}
              className="px-5 py-2.5 flex items-center gap-2 dot-matrix text-[11px] font-bold tracking-[0.2em] bg-white/80 backdrop-blur-xl border border-black/10 rounded-xl hover:bg-black hover:text-white transition-all uppercase"
            >
              ADD_NEW
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.loved.length === 0 ? (
              <div className="col-span-full">
                <EmptyShelf
                  label="Initialize_loved_data"
                  onClick={() => setModal('love')}
                  color="green"
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
        <div className="nothing-glass p-8 border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <div>
                <span className="block dot-matrix text-[10px] font-bold tracking-widest text-black/40 uppercase">
                  Avoid_List
                </span>
                <span className="dot-matrix text-xs font-bold text-black uppercase">
                  {profile.hated.length} Entries
                </span>
              </div>
            </div>
            <button
              onClick={() => setModal('hate')}
              className="px-5 py-2.5 flex items-center gap-2 dot-matrix text-[11px] font-bold tracking-[0.2em] bg-white/80 backdrop-blur-xl border border-black/10 rounded-xl hover:bg-black hover:text-white transition-all uppercase"
            >
              ADD_NEW
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.hated.length === 0 ? (
              <div className="col-span-full">
                <EmptyShelf
                  label="Initialize_avoid_data"
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
  color: 'green' | 'red';
}) {
  return (
    <button
      onClick={onClick}
      className="w-full h-44 nothing-glass border-dashed border-black/10 flex flex-col items-center justify-center gap-4 transition-all hover:bg-black/[0.02] group"
    >
      <div 
        className={`w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 border border-dashed ${color === 'green' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
      <span className="dot-matrix text-[10px] font-bold tracking-[0.2em] text-black/40 group-hover:text-black uppercase">
        {label}
      </span>
    </button>
  );
}
