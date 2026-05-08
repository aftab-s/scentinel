import { useState, useEffect } from 'react';
import type { UserProfile } from './types';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FragranceVault from './components/FragranceVault';
import RiskEngine from './components/RiskEngine';
import SmoothScroll from './components/SmoothScroll';

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
      <SmoothScroll>
        <Navbar currency={currency} onCurrencyChange={setCurrency} />

        <main className="relative z-10 pt-16">
          <HeroSection />

          <div className="max-w-7xl mx-auto px-4 md:px-8 my-16">
            <div className="h-px bg-black/5" />
          </div>

          <FragranceVault profile={profile} onUpdate={setProfile} currency={currency} />

          <div className="max-w-7xl mx-auto px-4 md:px-8 my-16">
            <div className="h-px bg-black/5" />
          </div>

          <RiskEngine profile={profile} currency={currency} />

          <footer className="relative mt-48 overflow-hidden pb-12 pt-24 px-4 md:px-8">
            <div className="max-w-7xl mx-auto relative h-full flex flex-col items-center">
              {/* Top Content Group */}
              <div className="relative z-10 text-center mb-12">
                <p className="text-[10px] text-black/60 dot-matrix tracking-[0.4em] uppercase mb-4">
                  DISCOVERY_ENGINE_v1.0
                </p>
                <p className="text-sm text-black/80 font-light max-w-md mx-auto leading-relaxed">
                  Predict your next favorite fragrance before the first spray.
                </p>
              </div>

              {/* Massive Watermark Section */}
              <div className="relative w-full flex flex-col items-center">
                {/* Copyright positioned top-right of the big text area */}
                <div className="absolute top-0 right-0 md:right-4 z-20">
                  <p className="text-[8px] text-black/40 font-bold tracking-[0.3em] uppercase text-right">
                    © 2026 Scentinel<br />
                    All Rights Reserved
                  </p>
                </div>

                {/* The Big One */}
                <h2 className="font-sora text-[15vw] leading-none font-medium tracking-tighter text-black/[0.08] select-none pointer-events-none whitespace-nowrap -mb-[2vw]">
                  Scentinel<span className="text-red-600/20">.</span>
                </h2>
              </div>
            </div>
          </footer>
        </main>
      </SmoothScroll>
    </div>
  );
}
