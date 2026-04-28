import { useState, useEffect } from 'react';
import type { UserProfile } from './types';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FragranceVault from './components/FragranceVault';
import RiskEngine from './components/RiskEngine';

const EMPTY_PROFILE: UserProfile = {
  loved: [],
  hated: [],
};

const getInitialProfile = (): UserProfile => {
  const saved = localStorage.getItem('scentinel_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return EMPTY_PROFILE;
    }
  }
  return EMPTY_PROFILE;
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    localStorage.setItem('scentinel_profile', JSON.stringify(profile));
  }, [profile]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C241B] relative">
      <Navbar currency={currency} onCurrencyChange={setCurrency} />

      <main className="relative z-10 pt-24">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 md:px-8 my-16">
          <div className="h-px bg-[#E8CFC1]/50" />
        </div>

        <FragranceVault profile={profile} onUpdate={setProfile} currency={currency} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 my-16">
          <div className="h-px bg-[#E8CFC1]/50" />
        </div>

        <RiskEngine profile={profile} currency={currency} />

        <footer className="text-center pb-12 px-4 mt-24">
          <div className="max-w-md mx-auto">
            <h2 className="serif text-2xl font-bold mb-4">Ikira</h2>
            <p className="text-sm text-[#4A3B32] sans-serif tracking-wide leading-relaxed">
              Curated Fragrance Intelligence<br />
              Elevate Your Signature Scent
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E8CFC1]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#D2A795]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#E8CFC1]" />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
