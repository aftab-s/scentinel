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
    accord: b.accord.toUpperCase(),
    Love: b.loveScore,
    Hate: b.hateScore,
    Target: b.targetHas ? Math.max(b.loveScore, 1) : 0,
  }));

  if (data.length === 0) return null;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="accord"
            tick={{ fill: 'rgba(0,0,0,0.3)', fontSize: 7, fontFamily: 'Space Mono', fontWeight: 'bold' }}
          />
          <Radar
            name="MATCH_POS"
            dataKey="Love"
            stroke="black"
            fill="black"
            fillOpacity={0.03}
            strokeWidth={1}
          />
          <Radar
            name="MATCH_NEG"
            dataKey="Hate"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.03}
            strokeWidth={1}
          />
          <Radar
            name="TARGET_VAL"
            dataKey="Target"
            stroke="black"
            fill="black"
            fillOpacity={0.1}
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(0,0,0,0.05)',
              borderRadius: '16px',
              fontFamily: 'Space Mono',
              fontSize: '9px',
              color: '#000',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {[
          { color: 'black', label: 'USER_LOVE', dotted: false },
          { color: '#ef4444', label: 'USER_HATE', dotted: false },
          { color: 'black', label: 'TARGET_VAL', dotted: true },
        ].map(({ color, label, dotted }) => (
          <div key={label} className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${dotted ? 'border-2 border-black bg-transparent' : ''}`} 
              style={{ background: dotted ? 'transparent' : color }} 
            />
            <span className="dot-matrix text-[8px] font-bold text-black/40 tracking-widest">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
