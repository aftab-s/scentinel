import { motion } from 'framer-motion';
import { Droplets, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-32 flex flex-col md:flex-row items-center justify-between overflow-hidden">
      

      {/* Left Column: Technical Messaging */}
      <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
             <span className="dot-matrix text-[10px] tracking-[0.4em] font-bold text-black/40">SENSORY_UNIT_CONNECTED</span>
          </div>
          <span className="dot-matrix text-[12vw] md:text-[6rem] leading-none font-bold tracking-tighter">
            Botanical
          </span>
          <span className="dot-matrix text-[12vw] md:text-[6rem] leading-none font-bold tracking-tighter text-black/20">
            Precision
          </span>
          <div className="flex items-center gap-4 mt-6">
            <div className="h-px w-16 bg-black" />
            <span className="dot-matrix text-xs tracking-[0.4em] font-bold">SCENT_INTEL_SYSTEM</span>
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-12 text-black/60 text-sm md:text-base max-w-sm font-light leading-relaxed"
        >
          An algorithmic approach to olfactory harmony. Scentinel synthesizes molecular data from botanical gardens and luxury perfumery to predict your next signature scent with crystalline clarity.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-12 flex items-center gap-8"
        >
          <button className="px-10 py-5 bg-black text-white dot-matrix text-[11px] tracking-[0.4em] font-bold rounded-xl hover:bg-red-600 transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)]">
            INITIALIZE_VAULT
          </button>
          <div className="flex flex-col">
            <span className="dot-matrix text-[9px] font-bold tracking-widest text-black/30 mb-1">ACTIVE_RECEPTORS</span>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-lg border-2 border-white bg-black/5 flex items-center justify-center overflow-hidden">
                  <div className={`w-4 h-4 rounded-full ${i % 2 === 0 ? 'bg-leaf-green/20' : 'bg-petal-pink/20'}`} />
                </div>
              ))}
              <div className="pl-4 dot-matrix text-[8px] font-bold self-center tracking-widest text-black/40">12.8k_SYNCED</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column: Organic Widget */}
      <div className="w-full md:w-5/12 mt-20 md:mt-0 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative aspect-[4/5] flex items-center justify-center group overflow-hidden"
        >
          {/* Main Visual */}
          <div className="absolute inset-0 rounded-xl overflow-hidden bg-black/5">
            <motion.img 
              src="/hero-botanical.png" 
              alt="Organic Scent Intelligence" 
              className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-110 group-hover:scale-100"
            />
            {/* Glass Overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-nothing-white/20 to-transparent pointer-events-none" />
          </div>
          
          {/* UI Metadata Overlays */}
          <div className="absolute top-8 left-8 dot-matrix text-[10px] font-bold tracking-[0.4em] text-black/40 mix-blend-difference">
            OOM_DATA_SCAN_01
          </div>
          
          <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
             <div className="w-1.5 h-1.5 rounded-full bg-leaf-green" />
             <span className="dot-matrix text-[8px] font-bold tracking-widest text-black/60">BOTANICAL_LOCK_READY</span>
          </div>

          {/* Scent Diffusion Trail */}
          <div className="absolute -left-12 bottom-1/4 flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div 
                key={i}
                animate={{ 
                  x: [0, 20, 0],
                  opacity: [0, 0.4, 0], 
                  scale: [0.5, 1.2, 0.5] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  delay: i * 0.4,
                  ease: 'easeInOut' 
                }}
                className={`w-${i % 2 === 0 ? '2' : '3'} h-${i % 2 === 0 ? '2' : '3'} bg-${i % 2 === 0 ? 'leaf-green' : 'petal-pink'} rounded-full blur-[1px]`}
              />
            ))}
          </div>
        </motion.div>
      </div>

    </section>
  );
}
