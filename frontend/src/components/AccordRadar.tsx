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
          <PolarGrid stroke="rgba(232, 207, 193, 0.4)" />
          <PolarAngleAxis
            dataKey="accord"
            tick={{ fill: '#4A3B32', fontSize: 10, fontFamily: 'Inter' }}
          />
          <Radar
            name="Loved"
            dataKey="Love"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.15}
            strokeWidth={1.5}
          />
          <Radar
            name="Hated"
            dataKey="Hate"
            stroke="#991b1b"
            fill="#991b1b"
            fillOpacity={0.1}
            strokeWidth={1.5}
          />
          <Radar
            name="Target"
            dataKey="Target"
            stroke="#D2A795"
            fill="#E8CFC1"
            fillOpacity={0.3}
            strokeWidth={2}
            strokeDasharray="4 2"
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(253, 251, 247, 0.95)',
              border: '1px solid rgba(232, 207, 193, 0.5)',
              borderRadius: '12px',
              fontFamily: 'Inter',
              fontSize: '11px',
              color: '#2C241B',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-1">
        {[
          { color: '#22c55e', label: 'Loved' },
          { color: '#991b1b', label: 'Hated' },
          { color: '#D2A795', label: 'Target' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[10px] text-[#4A3B32] sans-serif">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
