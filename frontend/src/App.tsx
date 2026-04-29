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
    <div className="min-h-screen bg-white text-black relative font-sans overflow-x-hidden">
      <Navbar currency={currency} onCurrencyChange={setCurrency} />

      <main className="relative z-10 pt-24">
        <HeroSection />

        <div className="max-w-7xl mx-auto px-4 md:px-8 my-16">
          <div className="h-px bg-black/5" />
        </div>

        <FragranceVault profile={profile} onUpdate={setProfile} currency={currency} />

        <div className="max-w-7xl mx-auto px-4 md:px-8 my-16">
          <div className="h-px bg-black/5" />
        </div>

        <RiskEngine profile={profile} currency={currency} />

        <footer className="text-center pb-24 px-4 mt-32">
          <div className="max-w-md mx-auto">
            <h2 className="dot-matrix text-3xl font-bold mb-4 red-dot">Scentinel</h2>
            <p className="text-xs text-black/50 dot-matrix tracking-widest leading-relaxed">
              Biological Intelligence <br />
              Digital Precision
            </p>
            <div className="mt-12 flex items-center justify-center gap-1">
              <div className="w-1 h-1 bg-black/20" />
              <div className="w-1 h-1 bg-black/20" />
              <div className="w-1 h-1 bg-black" />
              <div className="w-1 h-1 bg-black/20" />
              <div className="w-1 h-1 bg-black/20" />
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
