import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[340px] overflow-hidden pt-16 pb-8 px-4">
      {/* Mist blobs */}
      <motion.div
        className="mist-blob w-[500px] h-[500px] bg-[#D4AF37] opacity-[0.07] -top-32 -left-32"
        animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="mist-blob w-[400px] h-[400px] bg-[#7C3AED] opacity-[0.08] top-0 right-0"
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="mist-blob w-[300px] h-[300px] bg-[#D4AF37] opacity-[0.05] bottom-0 left-1/2"
        animate={{ x: [0, 20, -20, 0], y: [0, -20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <p className="text-xs tracking-[0.4em] text-[#D4AF37] uppercase mb-3 font-mono">
          Blind Buy Intelligence
        </p>
        <h1 className="serif text-5xl md:text-7xl font-bold leading-tight mb-4">
          <span className="gold-text">Scent</span>
          <span className="text-white">-inel</span>
        </h1>
        <p className="text-[#94A3B8] text-sm md:text-base max-w-md mx-auto leading-relaxed font-mono">
          The risk engine for fragrance obsessives. Know before you buy.
        </p>
      </motion.div>

      {/* Decorative line */}
      <motion.div
        className="relative z-10 mt-8 flex items-center gap-4 w-full max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
        <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
      </motion.div>
    </section>
  );
}
