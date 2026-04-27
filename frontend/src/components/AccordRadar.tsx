import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { AccordScore } from '../types';

interface Props {
  breakdown: AccordScore[];
}

export default function AccordRadar({ breakdown }: Props) {
  const data = breakdown.map(b => ({
    accord: b.accord,
    Love: b.loveScore,
    Hate: b.hateScore,
    Target: b.targetHas ? Math.max(b.loveScore, 1) : 0,
  }));

  if (data.length === 0) return null;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="accord"
            tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <Radar
            name="Loved"
            dataKey="Love"
            stroke="#D4AF37"
            fill="#D4AF37"
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
          <Radar
            name="Hated"
            dataKey="Hate"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.1}
            strokeWidth={1.5}
          />
          <Radar
            name="Target"
            dataKey="Target"
            stroke="#A78BFA"
            fill="#7C3AED"
            fillOpacity={0.2}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '12px',
              fontFamily: 'JetBrains Mono',
              fontSize: '11px',
              color: '#F8F4E8',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-1">
        {[
          { color: '#D4AF37', label: 'Loved' },
          { color: '#ef4444', label: 'Hated' },
          { color: '#A78BFA', label: 'Target' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-[#94A3B8] font-mono">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
