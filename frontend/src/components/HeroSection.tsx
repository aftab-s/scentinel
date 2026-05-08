import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16 flex flex-col md:flex-row items-center justify-between overflow-hidden">
      

      {/* Left Column: Technical Messaging */}
      <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
             <span className="dot-matrix text-[10px] tracking-[0.4em] font-bold text-black/60 uppercase">Blind Buy Intelligence</span>
          </div>
          <span className="font-sora text-[12vw] md:text-[6.5rem] leading-none font-medium tracking-tighter">
            Scentinel<span className="text-red-600">.</span>
          </span>
          <div className="flex items-center gap-4 mt-8">
            <div className="h-px w-16 bg-black/20" />
            <span className="dot-matrix text-[10px] tracking-[0.4em] font-bold text-black/60 uppercase">The Science of Selection</span>
          </div>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-10 text-black/60 text-base md:text-lg max-w-sm font-light leading-relaxed"
        >
          Predict your next favorite fragrance before the first spray. A sophisticated analysis tool for perfume enthusiasts who want to discover their signature scent with confidence.
        </motion.p>

      </div>

      {/* Right Column: Organic Widget */}
      <div className="w-full md:w-5/12 mt-20 md:mt-0 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative aspect-square flex items-center justify-center group overflow-hidden"
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
          
          <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-2.5 rounded-xl border border-black/5 shadow-sm">
             <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
             <span className="dot-matrix text-[8px] font-bold tracking-widest text-black/80 uppercase">Discovery_Engine_Ready</span>
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
