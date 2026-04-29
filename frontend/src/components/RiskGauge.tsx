import { motion } from 'framer-motion';

interface Props {
  score: number; // 0–100
}

export default function RiskGauge({ score }: Props) {
  const radius = 80;
  const stroke = 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;

  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="relative flex items-center justify-center w-56 h-56">
      <svg
        width="224"
        height="224"
        viewBox="0 0 224 224"
        className="absolute inset-0"
        style={{ transform: 'rotate(135deg)' }}
      >
        {/* Technical Dotted Background Track */}
        <circle
          cx="112"
          cy="112"
          r={normalizedRadius}
          fill="none"
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth={stroke}
          strokeDasharray="2 4"
          style={{ strokeDashoffset: 0 }}
        />

        {/* Progress arc */}
        <motion.circle
          cx="112"
          cy="112"
          r={normalizedRadius}
          fill="none"
          stroke="black"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="square"
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Technical Ticks */}
        {ticks.map(tick => {
          const angle = (tick / 100) * 270 * (Math.PI / 180);
          const x1 = 112 + (normalizedRadius - 10) * Math.cos(angle);
          const y1 = 112 + (normalizedRadius - 10) * Math.sin(angle);
          const x2 = 112 + (normalizedRadius + 2) * Math.cos(angle);
          const y2 = 112 + (normalizedRadius + 2) * Math.sin(angle);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="black"
              strokeWidth="0.5"
              opacity="0.2"
            />
          );
        })}
      </svg>

      {/* Center content: Technical readout */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="flex items-center gap-1 mb-1">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="dot-matrix text-[8px] font-bold tracking-[0.2em] text-black/30 uppercase">LIVE_CALC</span>
        </div>
        
        <motion.span
          className="dot-matrix font-bold text-5xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {score}
        </motion.span>
        
        <div className="flex flex-col items-center mt-2">
          <span className="dot-matrix text-[10px] text-black font-bold tracking-[0.3em] uppercase">
            RISK_PERCENT
          </span>
          <div className="mt-4 flex gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i} 
                className={`w-4 h-1 rounded-full transition-colors duration-1000 ${i <= (score/20) ? 'bg-black' : 'bg-black/5'}`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
