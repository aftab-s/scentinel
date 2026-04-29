import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Info, CheckCircle, AlertTriangle, XCircle, Loader2, Sparkles, Droplets } from 'lucide-react';
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
    if (score >= 80) return <CheckCircle size={20} className="text-[#4A3B32]" />;
    if (score >= 50) return <AlertTriangle size={20} className="text-[#D2A795]" />;
    return <XCircle size={20} className="text-red-800/60" />;
  };

  return (
    <section id="risk-engine" className="px-4 md:px-8 max-w-7xl mx-auto mb-24 relative z-10">
      <div className="flex flex-col items-center mb-12 text-center">
        <h2 className="serif text-4xl md:text-5xl font-bold text-[#2C241B] mb-4">
          Risk Engine
        </h2>
        <p className="text-[#4A3B32] sans-serif max-w-lg">
          Analyze the compatibility of a prospective fragrance against your established preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Search & Details */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div
            className="glass rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-6 text-[#4A3B32]">
              <Search size={16} />
              <p className="text-xs uppercase tracking-widest font-semibold">Target Inquiry</p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              <input
                className="w-full bg-[#FDFBF7] border border-[#E8CFC1] rounded-xl px-4 py-3.5 text-sm text-[#2C241B] placeholder-[#4A3B32]/40 focus:outline-none focus:border-[#D2A795] focus:ring-1 focus:ring-[#D2A795] transition-all sans-serif"
                placeholder="Enter a fragrance name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="w-full py-3.5 rounded-xl sans-serif text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-[#4A3B32] text-[#FDFBF7] hover:bg-[#2C241B]"
              >
                {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search Database'}
              </button>
            </div>

            {searchError && (
              <p className="text-xs text-red-800/80 mb-4 sans-serif px-2">{searchError}</p>
            )}

            <AnimatePresence mode="wait">
              {target && (
                <motion.div
                  key="target-details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 pt-6 border-t border-[#E8CFC1]/40"
                >
                  <div className="text-center">
                    <p className="text-xs text-[#D2A795] uppercase tracking-widest mb-1 sans-serif font-semibold">{target.brand}</p>
                    <p className="text-[#2C241B] font-bold serif text-2xl">{target.name}</p>
                  </div>

                  {target.accords && target.accords.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {target.accords.map(accord => (
                        <span key={accord} className="text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-semibold bg-[#E8CFC1]/30 text-[#4A3B32]">
                          {accord}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Visual Notes Pyramid */}
                  {target.notes && (target.notes.top?.length > 0 || target.notes.middle?.length > 0 || target.notes.base?.length > 0) && (
                    <div className="py-4 space-y-4">
                      <p className="text-xs text-[#4A3B32] uppercase tracking-widest text-center font-semibold mb-2">Olfactory Pyramid</p>
                      
                      {target.notes.top?.length > 0 && (
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-[#D2A795] font-bold tracking-widest mb-1">Top Notes</p>
                          <p className="text-sm text-[#4A3B32] serif italic">{target.notes.top.join(', ')}</p>
                        </div>
                      )}
                      
                      {target.notes.middle?.length > 0 && (
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-[#D2A795] font-bold tracking-widest mb-1">Heart Notes</p>
                          <p className="text-sm text-[#4A3B32] serif italic">{target.notes.middle.join(', ')}</p>
                        </div>
                      )}
                      
                      {target.notes.base?.length > 0 && (
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-[#D2A795] font-bold tracking-widest mb-1">Base Notes</p>
                          <p className="text-sm text-[#4A3B32] serif italic">{target.notes.base.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E8CFC1]/40">
                    <p className="text-xs text-[#4A3B32] uppercase tracking-widest mb-2 font-semibold">Retail Price ({currency})</p>
                    <input
                      className="w-full bg-[#FDFBF7] border border-[#E8CFC1] rounded-xl px-4 py-3 text-sm text-[#2C241B] placeholder-[#4A3B32]/40 focus:outline-none focus:border-[#D2A795] transition-all sans-serif mb-4"
                      placeholder="Optional price..."
                      type="number"
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                    />
                    
                    <button
                      onClick={handleCalculate}
                      disabled={calculating}
                      className={`w-full py-4 rounded-xl sans-serif text-sm font-semibold flex items-center justify-center gap-2 transition-all bg-[#D2A795] text-white hover:bg-[#C19482] shadow-sm ${
                        calculating ? 'opacity-80' : ''
                      }`}
                    >
                      {calculating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Analyzing Compatibility...
                        </>
                      ) : (
                        'Generate Risk Assessment'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                className="glass rounded-2xl p-6 md:p-10 min-h-full flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E8CFC1]/40">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-[#D2A795]" />
                    <p className="text-xs text-[#4A3B32] uppercase tracking-widest font-semibold">Intelligence Report</p>
                  </div>
                  {result.score >= 80 && <span className="text-[10px] bg-[#E8CFC1]/40 text-[#4A3B32] px-2 py-1 rounded-full uppercase tracking-wider font-bold">Approved</span>}
                </div>

                <div className="flex flex-col items-center mb-10">
                  <RiskGauge score={result.score} />
                  
                  <motion.div
                    className="mt-8 text-center max-w-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {getVerdictIcon(result.score)}
                      <span className="serif text-2xl font-bold text-[#2C241B]">
                        {result.score >= 80 ? 'Safe Acquisition' : result.score >= 50 ? 'Proceed with Caution' : 'High Risk Profile'}
                      </span>
                    </div>
                    <p className="text-sm text-[#4A3B32] sans-serif italic leading-relaxed">
                      "{result.verdict}"
                    </p>
                  </motion.div>
                </div>

                {result.ai_insight && (
                  <motion.div
                    className="bg-[#FDFBF7] border border-[#E8CFC1]/50 rounded-xl p-5 mb-8 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles size={16} className="text-[#D2A795] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-[#D2A795] uppercase tracking-widest font-bold mb-2">Curator's Note</p>
                        <p className="text-sm text-[#4A3B32] leading-relaxed sans-serif">
                          {result.ai_insight}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-4">
                  {result.breakdown && result.breakdown.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <p className="text-xs text-[#4A3B32] uppercase tracking-widest font-semibold mb-4 text-center">Accord Alignment</p>
                      <AccordRadar breakdown={result.breakdown} />
                    </motion.div>
                  )}

                  {result.clones && result.clones.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 }}
                      className="flex flex-col"
                    >
                      <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                        <Info size={14} className="text-[#D2A795]" />
                        <p className="text-xs text-[#4A3B32] uppercase tracking-widest font-semibold">Alternative Suggestions</p>
                      </div>
                      
                      <div className="space-y-3 flex-1">
                        {result.clones.map((clone, idx) => (
                          <motion.div
                            key={`${clone.brand}-${clone.name}`}
                            className="bg-[#FDFBF7] rounded-xl p-4 border border-[#E8CFC1]/30 hover:border-[#D2A795] transition-colors shadow-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.5 + idx * 0.1 }}
                          >
                            <div className="flex justify-between items-start mb-1 gap-3">
                              {clone.url ? (
                                <a
                                  href={clone.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-[#2C241B] font-bold serif hover:text-[#D2A795] transition-colors"
                                >
                                  {clone.brand} — {clone.name}
                                </a>
                              ) : (
                                <p className="text-sm text-[#2C241B] font-bold serif">{clone.brand} — {clone.name}</p>
                              )}
                              {clone.price != null && (
                                <p className="text-xs font-semibold text-[#D2A795] whitespace-nowrap">
                                  ${clone.price} {clone.currency}
                                </p>
                              )}
                            </div>
                            <p className="text-[11px] text-[#4A3B32] sans-serif leading-relaxed">
                              {clone.reason}
                            </p>
                            {clone.source && (
                              <p className="text-[10px] text-[#4A3B32]/50 sans-serif mt-2 truncate">
                                {clone.source}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="glass rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[400px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-16 h-16 rounded-full bg-[#E8CFC1]/20 flex items-center justify-center mb-4">
                  <Search size={24} className="text-[#D2A795]" />
                </div>
                <p className="text-[#4A3B32] text-sm sans-serif text-center max-w-xs leading-relaxed">
                  Initiate a search to generate a personalized risk assessment for your next acquisition.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
