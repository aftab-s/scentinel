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
      {/* Organic Background Layer 1: Breathing Gradient */}
      <div className="bg-breathing" />
      
      {/* Organic Background Layer 2: Botanical Pattern */}
      <div className="fixed inset-0 botanical-pattern opacity-10 pointer-events-none" />

      {/* Scent Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="scent-particle"
            style={{
              width: `${Math.random() * 400 + 100}px`,
              height: `${Math.random() * 400 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `breathing ${Math.random() * 5 + 5}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

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
