import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-[#D4AF37]/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#D4AF37] border-r-[#7C3AED]" />
      </motion.div>
    </div>
  );
}
