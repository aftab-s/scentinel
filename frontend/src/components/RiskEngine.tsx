import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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


  return (
    <section id="risk-engine" className="px-4 md:px-8 max-w-7xl mx-auto mb-32 relative z-10">
      <div className="flex flex-col items-center mb-16 text-center">
        <h2 className="dot-matrix text-4xl md:text-5xl font-bold text-black mb-4 uppercase">
          Match_Engine
        </h2>
        <div className="flex items-center gap-4">
          <div className="h-px w-8 bg-black/20" />
          <p className="text-black/80 dot-matrix text-[10px] tracking-[0.4em] font-bold uppercase">
            Blind Buy Intelligence
          </p>
          <div className="h-px w-8 bg-black/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Search & Details */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <motion.div
            className="nothing-glass p-8 border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
              <p className="dot-matrix text-[10px] tracking-[0.2em] font-bold text-black uppercase">Selection</p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <input
                className="w-full bg-black/[0.03] border border-black/10 rounded-xl px-5 py-4 dot-matrix text-sm text-black placeholder-black/40 focus:ring-2 focus:ring-black/10 transition-all outline-none"
                placeholder="Search fragrance name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim() || searching}
                className="w-full py-4 rounded-xl dot-matrix text-[10px] tracking-[0.3em] font-bold transition-all flex items-center justify-center gap-2 bg-black text-white hover:bg-red-600 active:scale-[0.98] shadow-md disabled:bg-black/40 disabled:text-white/40 disabled:shadow-none disabled:cursor-not-allowed uppercase"
              >
                {searching ? <Loader2 size={16} className="animate-spin" /> : 'Analyze'}
              </button>
            </div>

            {searchError && (
              <p className="dot-matrix text-[9px] text-red-500 font-bold tracking-widest mb-6 px-2">{searchError}</p>
            )}

            <AnimatePresence mode="wait">
              {target && (
                <motion.div
                  key="target-details"
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  className="space-y-8 pt-8 border-t border-black/5"
                >
                  <div className="text-center">
                    <p className="dot-matrix text-[9px] text-black/40 tracking-[0.3em] mb-2 font-bold uppercase">{target.brand}</p>
                    <p className="text-black font-bold dot-matrix text-2xl uppercase">{target.name}</p>
                  </div>

                  {target.accords && target.accords.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {target.accords.map(accord => (
                        <span key={accord} className="dot-matrix text-[8px] px-3 py-1.5 rounded-full font-bold tracking-widest bg-black/[0.03] text-black/40 border border-black/5">
                          {accord}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Visual Notes Pyramid */}
                  {target.notes && (target.notes.top?.length > 0 || target.notes.middle?.length > 0 || target.notes.base?.length > 0) && (
                    <div className="py-4 space-y-6">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="h-px w-4 bg-black/10" />
                        <p className="dot-matrix text-[8px] text-black/40 tracking-[0.3em] font-bold uppercase">Scent_Profile</p>
                        <div className="h-px w-4 bg-black/10" />
                      </div>
                      
                      {target.notes.top?.length > 0 && (
                        <div className="text-center">
                          <p className="dot-matrix text-[8px] text-black/20 font-bold tracking-widest mb-1 uppercase">Opening</p>
                          <p className="dot-matrix text-xs text-black/60">{target.notes.top.join(' · ')}</p>
                        </div>
                      )}
                      
                      {target.notes.middle?.length > 0 && (
                        <div className="text-center">
                          <p className="dot-matrix text-[8px] text-black/20 font-bold tracking-widest mb-1 uppercase">Heart</p>
                          <p className="dot-matrix text-xs text-black/60">{target.notes.middle.join(' · ')}</p>
                        </div>
                      )}
                      
                      {target.notes.base?.length > 0 && (
                        <div className="text-center">
                          <p className="dot-matrix text-[8px] text-black/20 font-bold tracking-widest mb-1 uppercase">Base</p>
                          <p className="dot-matrix text-xs text-black/60">{target.notes.base.join(' · ')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-8 border-t border-black/5">
                    <p className="dot-matrix text-[9px] text-black/40 tracking-[0.2em] mb-3 font-bold uppercase">Price Index ({currency})</p>
                    <input
                      className="w-full bg-black/5 border-none rounded-xl px-5 py-4 dot-matrix text-sm text-black placeholder-black/20 focus:ring-2 focus:ring-black/5 transition-all mb-6"
                      placeholder="Retail Price..."
                      type="number"
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                    />
                    
                    <button
                      onClick={handleCalculate}
                      disabled={calculating}
                      className={`w-full py-5 rounded-xl dot-matrix text-[11px] tracking-[0.4em] font-bold flex items-center justify-center gap-3 transition-all bg-black text-white hover:bg-red-600 shadow-lg ${
                        calculating ? 'opacity-80' : ''
                      }`}
                    >
                      {calculating ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> RUNNING_ANALYSIS...
                        </>
                      ) : (
                        'Analyze Compatibility'
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
                className="nothing-glass p-8 md:p-12 min-h-full flex flex-col border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.02)]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    <p className="dot-matrix text-[10px] tracking-[0.3em] font-bold text-black/40 uppercase">Compatibility Assessment</p>
                  </div>
                  {result.score >= 80 && <span className="dot-matrix text-[8px] bg-red-600 text-white px-3 py-1 rounded-full tracking-[0.2em] font-bold uppercase">Perfect Match</span>}
                </div>

                <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
                  <RiskGauge score={result.score} />
                  
                  <motion.div
                    className="flex-1 text-center md:text-left"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                      <div className={`w-2 h-2 rounded-full ${result.score >= 80 ? 'bg-green-500' : result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="dot-matrix text-2xl font-bold text-black uppercase">
                        {result.score >= 80 ? 'Recommended' : result.score >= 50 ? 'Cautious' : 'Not for you'}
                      </span>
                    </div>
                    <p className="dot-matrix text-sm text-black/60 italic leading-relaxed">
                      "{result.verdict}"
                    </p>
                  </motion.div>
                </div>

                {(result.ai_insight || result.ai_risk_breakdown || result.ai_layering_suggestion) && (
                  <motion.div
                    className="nothing-glass p-6 mb-12 border-black/5 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                    <div className="flex flex-col gap-6">
                      {result.ai_insight && (
                        <div className="flex items-start gap-4">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="dot-matrix text-[9px] text-black/40 tracking-[0.3em] font-bold mb-2 uppercase">Scentinel Insight</p>
                            <p className="text-sm text-black/80 leading-relaxed">
                              {result.ai_insight}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.ai_risk_breakdown && (
                        <div className="flex items-start gap-4 pt-4 border-t border-black/10">
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="dot-matrix text-[9px] text-black/40 tracking-[0.3em] font-bold mb-2 uppercase">Compatibility Breakdown</p>
                            <p className="text-sm text-black/80 leading-relaxed">
                              {result.ai_risk_breakdown}
                            </p>
                          </div>
                        </div>
                      )}

                      {result.ai_layering_suggestion && (
                        <div className="flex items-start gap-4 pt-4 border-t border-black/10">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="dot-matrix text-[9px] text-black/40 tracking-[0.3em] font-bold mb-2 uppercase">Layering Suggestion</p>
                            <p className="text-sm text-black/80 leading-relaxed">
                              {result.ai_layering_suggestion}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-12">
                  {result.breakdown && result.breakdown.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      <p className="dot-matrix text-[9px] text-black/40 tracking-[0.2em] font-bold mb-8 text-center uppercase">Profile_Alignment_Radar</p>
                      <AccordRadar breakdown={result.breakdown} />
                    </motion.div>
                  )}

                  {result.clones && result.clones.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.4 }}
                      className="flex flex-col"
                    >
                      <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        <p className="dot-matrix text-[9px] tracking-[0.2em] font-bold text-black/40 uppercase">Recommended Alternatives</p>
                      </div>
                      
                      <div className="space-y-4">
                        {result.clones.map((clone, idx) => (
                          <motion.div
                            key={`${clone.brand}-${clone.name}`}
                            className="nothing-glass p-5 border-black/5 hover:border-black/20 transition-all shadow-sm group"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.5 + idx * 0.1 }}
                          >
                            <div className="flex justify-between items-start mb-2 gap-4">
                              {clone.url ? (
                                <a
                                  href={clone.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="dot-matrix text-xs text-black font-bold hover:text-red-500 transition-colors uppercase truncate"
                                >
                                  {clone.brand}_{clone.name}
                                </a>
                              ) : (
                                <p className="dot-matrix text-xs text-black font-bold uppercase truncate">{clone.brand}_{clone.name}</p>
                              )}
                              {clone.price != null && (
                                <p className="dot-matrix text-[9px] font-bold text-black/30 whitespace-nowrap">
                                  {clone.currency}_{clone.price}
                                </p>
                              )}
                            </div>
                            <p className="dot-matrix text-[10px] text-black/50 leading-relaxed">
                              {clone.reason}
                            </p>
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
                className="nothing-glass p-8 flex flex-col items-center justify-center h-full min-h-[500px] border-dashed border-black/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-20 h-20 rounded-xl bg-black/[0.05] border border-black/10 flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 border border-dashed border-black/20 rounded-xl" />
                </div>
                <p className="dot-matrix text-black/60 text-[10px] tracking-[0.2em] font-bold text-center max-w-xs leading-relaxed uppercase">
                  Select a fragrance to begin analysis
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
