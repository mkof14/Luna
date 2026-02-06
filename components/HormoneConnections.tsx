
import React, { useEffect, useState } from 'react';

interface Connection {
  from: string;
  to: string;
  label: string;
}

const CONNECTIONS: Connection[] = [
  { from: 'cortisol', to: 'thyroid', label: 'Stress inhibits metabolism' },
  { from: 'estrogen', to: 'progesterone', label: 'Essential cycle ratio' },
  { from: 'insulin', to: 'cortisol', label: 'Blood sugar stress trigger' },
];

export const HormoneConnections: React.FC<{ active: boolean }> = ({ active }) => {
  const [lines, setLines] = useState<{ d: string, label: string, x: number, y: number }[]>([]);

  useEffect(() => {
    if (!active) {
      setLines([]);
      return;
    }

    const calculateLines = () => {
      const newLines = CONNECTIONS.map(conn => {
        const fromEl = document.getElementById(`hormone-card-${conn.from}`);
        const toEl = document.getElementById(`hormone-card-${conn.to}`);
        
        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          const parentRect = fromEl.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };

          const startX = fromRect.left + fromRect.width / 2 - parentRect.left;
          const startY = fromRect.top + fromRect.height / 2 - parentRect.top;
          const endX = toRect.left + toRect.width / 2 - parentRect.left;
          const endY = toRect.top + toRect.height / 2 - parentRect.top;

          // Midpoint for label
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          return {
            d: `M ${startX} ${startY} Q ${(startX + endX) / 2} ${(startY + endY) / 2 + 50} ${endX} ${endY}`,
            label: conn.label,
            x: midX,
            y: midY + 20
          };
        }
        return null;
      }).filter(Boolean) as any[];

      setLines(newLines);
    };

    calculateLines();
    window.addEventListener('resize', calculateLines);
    return () => window.removeEventListener('resize', calculateLines);
  }, [active]);

  if (!active) return null;

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#ec4899" opacity="0.5" />
        </marker>
      </defs>
      {lines.map((line, i) => (
        <g key={i} className="animate-in fade-in duration-700">
          <path
            d={line.d}
            stroke="#ec4899"
            strokeWidth="2"
            strokeDasharray="8 4"
            fill="none"
            opacity="0.3"
            markerEnd="url(#arrowhead)"
            className="animate-[dash_20s_linear_infinite]"
          />
          <foreignObject x={line.x - 60} y={line.y} width="120" height="40">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur px-2 py-1 rounded-lg border border-pink-200 dark:border-pink-900/40 text-[9px] font-black text-pink-600 dark:text-pink-400 text-center shadow-lg uppercase tracking-tighter leading-tight">
              {line.label}
            </div>
          </foreignObject>
        </g>
      ))}
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </svg>
  );
};
