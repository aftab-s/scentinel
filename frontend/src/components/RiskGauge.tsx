import { motion } from 'framer-motion';

interface Props {
  score: number; // 0–100
}

export default function RiskGauge({ score }: Props) {
  const radius = 80;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // We only use 270° of the circle (from 135° to 405°)
  const arcLength = circumference * 0.75;
  const offset = arcLength - (score / 100) * arcLength;

  // Color interpolation: green → gold → red
  const getColor = (s: number) => {
    if (s >= 80) return '#22c55e';
    if (s >= 50) return '#D4AF37';
    return '#ef4444';
  };

  const color = getColor(score);

  // Tick marks
  const ticks = [0, 25, 50, 75, 100];

  return (
    <div className="relative flex items-center justify-center w-52 h-52">
      <svg
        width="208"
        height="208"
        viewBox="0 0 208 208"
        className="absolute inset-0"
        style={{ transform: 'rotate(135deg)' }}
      >
        {/* Background track */}
        <circle
          cx="104"
          cy="104"
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <motion.circle
          cx="104"
          cy="104"
          r={normalizedRadius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
        />

        {/* Tick marks */}
        {ticks.map(tick => {
          const angle = (tick / 100) * 270 * (Math.PI / 180);
          const x1 = 104 + (normalizedRadius - 14) * Math.cos(angle);
          const y1 = 104 + (normalizedRadius - 14) * Math.sin(angle);
          const x2 = 104 + (normalizedRadius - 8) * Math.cos(angle);
          const y2 = 104 + (normalizedRadius - 8) * Math.sin(angle);
          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.span
          className="font-mono font-bold text-4xl"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, ease: 'backOut' }}
        >
          {score}
          <span className="text-lg">%</span>
        </motion.span>
        <span className="text-[10px] text-[#94A3B8] uppercase tracking-widest mt-1">
          Risk Score
        </span>
      </div>

      {/* Outer decorative ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at center, transparent 60%, ${color}08 100%)`,
        }}
      />
    </div>
  );
}
