import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, AlertTriangle, CheckCircle, XCircle, Lightbulb, Loader2, Sparkles } from 'lucide-react';
import type { Fragrance, UserProfile, RiskResult } from '../types';
import { calculateRisk, searchFragrance } from '../api';
import RiskGauge from './RiskGauge';
import AccordRadar from './AccordRadar';

interface Props {
  profile: UserProfile;
  currency: string;
}

export default function RiskEngine({ profile, currency }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  const [target, setTarget] = useState<Fragrance | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  
  const [result, setResult] = useState<RiskResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchError('');
    setResult(null);
    
    try {
      const data = await searchFragrance(searchQuery);
      setTarget({
        id: 'target',
        brand: data.brand,
        name: data.name,
        accords: data.accords,
        notes: data.notes,
        image_url: data.image_url,
        currency,
      });
    } catch (err: any) {
      setSearchError(err.message || 'Fragrance not found');
      setTarget(null);
    } finally {
      setSearching(false);
    }
  };

  const handleCalculate = async () => {
    if (!target) return;
    
    setCalculating(true);
    setResult(null);
    
    try {
      const targetWithPrice: Fragrance = {
        ...target,
        price: targetPrice ? parseFloat(targetPrice) : undefined,
        currency,
      };
      
      const res = await calculateRisk(targetWithPrice, profile);
      setResult(res);
    } catch (err) {
      console.error('Risk calculation failed:', err);
    } finally {
      setCalculating(false);
    }
  };

  const getVerdictIcon = (score: number) => {
    if (score >= 80) return <CheckCircle size={20} className="text-green-400" />;
    if (score >= 50) return <AlertTriangle size={20} className="text-[#D4AF37]" />;
    return <XCircle size={20} className="text-red-400" />;
  };

  const getVerdictColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#D4AF37';
    return '#ef4444';
  };

  return (
    <section className="px-4 md:px-8 max-w-7xl mx-auto mb-16">
      {/* Section header */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Zap size={20} className="text-[#7C3AED]" />
        <h2 className="serif text-3xl font-semibold text-white">
          The Risk Engine
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-[#7C3AED]/30 to-transparent ml-2" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Search panel */}
        <motion.div
          className="lg:col-span-2 glass rounded-3xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Search size={14} className="text-[#7C3AED]" />
            <p className="text-xs text-[#94A3B8] uppercase tracking-widest font-mono">
              Target Fragrance
            </p>
          </div>

          {/* Search bar */}
          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED]/50 transition-colors font-mono"
              placeholder="Search fragrance..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || searching}
              className="px-5 py-3 rounded-xl font-mono text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                color: '#fff',
              }}
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            </button>
          </div>

          {searchError && (
            <p className="text-xs text-red-400 mb-4 font-mono">{searchError}</p>
          )}

          {/* Target details */}
          {target && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {target.image_url && (
                <div className="flex justify-center mb-4">
                  <img
                    src={target.image_url}
                    alt={target.name}
                    className="w-20 h-20 object-contain"
                  />
                </div>
              )}

              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">Brand</p>
                <p className="text-white font-semibold serif text-lg">{target.brand}</p>
              </div>

              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">Name</p>
                <p className="text-white font-semibold serif text-lg">{target.name}</p>
              </div>

              {target.accords.length > 0 && (
                <div>
                  <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-2 font-mono">Accords</p>
                  <div className="flex flex-wrap gap-2">
                    {target.accords.map(accord => (
                      <span
                        key={accord}
                        className="text-xs px-3 py-1.5 rounded-full font-mono bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#A78BFA]"
                      >
                        {accord}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Price input */}
              <div>
                <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-1 font-mono">
                  Price ({currency}) — Optional
                </p>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/50 transition-colors font-mono"
                  placeholder="e.g. 320"
                  type="number"
                  value={targetPrice}
                  onChange={e => setTargetPrice(e.target.value)}
                />
              </div>

              {/* Calculate button */}
              <button
                onClick={handleCalculate}
                disabled={calculating}
                className={`w-full py-3.5 rounded-xl font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  calculating ? 'pulse-gold' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
                  color: '#fff',
                }}
              >
                {calculating ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Calculate Risk
                  </>
                )}
              </button>
            </motion.div>
          )}

          {!target && !searching && (
            <p className="text-center text-[#94A3B8]/60 text-sm font-mono py-8">
              Search for a fragrance to begin
            </p>
          )}
        </motion.div>

        {/* Result panel */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                className="glass rounded-3xl p-8"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Dashboard header */}
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={16} className="text-[#D4AF37]" />
                  <p className="text-xs text-[#94A3B8] uppercase tracking-widest font-mono">
                    Scent-inel Dashboard
                  </p>
                </div>

                {/* Gauge + verdict */}
                <div className="flex flex-col items-center mb-8">
                  <RiskGauge score={result.score} />

                  <motion.div
                    className="mt-6 text-center max-w-md"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getVerdictIcon(result.score)}
                      <span
                        className="serif text-xl font-semibold"
                        style={{ color: getVerdictColor(result.score) }}
                      >
                        {result.score >= 80 ? 'Safe Buy' : result.score >= 50 ? 'Proceed with Caution' : 'High Risk'}
                      </span>
                    </div>
                    <p className="text-sm text-[#94A3B8] font-mono italic leading-relaxed">
                      "{result.verdict}"
                    </p>
                  </motion.div>
                </div>

                {/* AI Insight */}
                {result.ai_insight && (
                  <motion.div
                    className="glass-gold rounded-2xl p-5 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-mono mb-2">
                          AI Insight
                        </p>
                        <p className="text-sm text-white/90 leading-relaxed font-mono">
                          {result.ai_insight}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Radar */}
                {result.breakdown.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="mb-6"
                  >
                    <p className="text-xs text-[#94A3B8] uppercase tracking-widest mb-3 font-mono">
                      Note Alignment
                    </p>
                    <AccordRadar breakdown={result.breakdown} />
                  </motion.div>
                )}

                {/* Clone suggestion */}
                {result.clone && (
                  <motion.div
                    className="glass-gold rounded-2xl p-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                  >
                    <div className="flex items-start gap-3">
                      <Lightbulb size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#D4AF37] uppercase tracking-widest font-mono mb-2">
                          Clone Finder — Pro Tip
                        </p>
                        <p className="text-base text-white font-semibold serif">
                          {result.clone.brand} — {result.clone.name}
                        </p>
                        <p className="text-xs text-[#94A3B8] font-mono mt-1">
                          ~{result.clone.currency} {result.clone.price} · {result.clone.reason}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="glass rounded-3xl p-8 flex flex-col items-center justify-center min-h-96"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-20 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center mb-4">
                  <Zap size={32} className="text-[#7C3AED]/50" />
                </div>
                <p className="text-[#94A3B8] text-sm font-mono text-center max-w-xs leading-relaxed">
                  Search for a target fragrance and calculate your personalized blind buy risk
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
