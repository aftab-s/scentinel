import { useState } from 'react';
import type { UserProfile } from './types';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FragranceVault from './components/FragranceVault';
import RiskEngine from './components/RiskEngine';

const EMPTY_PROFILE: UserProfile = {
  loved: [],
  hated: [],
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [currency, setCurrency] = useState('USD');

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      {/* Global background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(212,175,55,0.05) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(124,58,237,0.06) 0%, transparent 60%)',
        }}
      />

      <Navbar currency={currency} onCurrencyChange={setCurrency} />

      <main className="relative z-10 pt-20">
        <HeroSection />

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
        </div>

        <FragranceVault profile={profile} onUpdate={setProfile} currency={currency} />

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-[#7C3AED]/20 to-transparent" />
        </div>

        <RiskEngine profile={profile} currency={currency} />

        {/* Footer */}
        <footer className="text-center pb-12 px-4 mt-16">
          <div className="max-w-md mx-auto">
            <p className="text-[10px] text-[#94A3B8]/40 font-mono uppercase tracking-[0.2em] leading-relaxed">
              Scent-inel · Blind Buy Intelligence<br />
              Built for Fragrance Obsessives
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#D4AF37]/30" />
              <div className="w-1 h-1 rounded-full bg-[#7C3AED]/30" />
              <div className="w-1 h-1 rounded-full bg-[#D4AF37]/30" />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
