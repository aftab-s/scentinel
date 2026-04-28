import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24 flex flex-col md:flex-row items-center justify-between">
      
      {/* Left Typography Column */}
      <div className="w-full md:w-1/2 flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col text-[14vw] md:text-[8rem] lg:text-[9rem] leading-[0.85] text-[#4A3B32] serif tracking-tighter uppercase"
        >
          <span className="ml-0 md:ml-4">Blind</span>
          <span className="ml-12 md:ml-24">Buy</span>
          <span className="ml-4 md:ml-8 text-[#D2A795]">Intel.</span>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8 md:mt-12 text-[#4A3B32] text-sm md:text-base max-w-sm sans-serif leading-relaxed"
        >
          Scentinel is a refined risk engine where the delicate art of perfumery meets data-driven intelligence. Calculate the risk of your next blind buy and discover curated alternatives that embody elegance.
        </motion.p>
      </div>

      {/* Right Image Column */}
      <div className="w-full md:w-1/2 mt-16 md:mt-0 relative flex justify-center md:justify-end">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative w-full max-w-lg aspect-[4/5] md:aspect-auto md:h-[600px]"
        >
          {/* Aesthetic Arch Background */}
          <div className="absolute inset-0 bg-[#F4EFE6] rounded-t-full shadow-sm overflow-hidden flex items-center justify-center">
            <img 
              src="/hero-image.png" 
              alt="Luxury Perfume" 
              className="w-full h-full object-cover mix-blend-multiply opacity-90"
            />
          </div>
          
          {/* Floating badge */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-12 -left-4 md:-left-12 glass rounded-full px-6 py-3 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-[#D2A795] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-semibold text-[#4A3B32]">Risk Engine V2</span>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
