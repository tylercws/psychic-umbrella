import { motion } from 'motion/react';

interface StatsPanelProps {
  tracks: any[];
}

export function StatsPanel({ tracks }: StatsPanelProps) {
  // Compute Stats
  const avgBpm = tracks.length > 0
    ? Math.round(tracks.reduce((acc, t) => acc + t.bpm, 0) / tracks.length)
    : 0;

  const dominantKey = (() => {
    if (tracks.length === 0) return '--';
    const counts: any = {};
    tracks.forEach(t => counts[t.key] = (counts[t.key] || 0) + 1);
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1])[0][0];
  })();

  const vibe = tracks.length > 0 ? tracks[0].texture : "IDLE";

  return (
    <div className="flex flex-col gap-6 border-4 border-double border-white/40 p-6 bg-black/80 relative overflow-hidden">
      {/* BPM Display */}
      <div className="text-right relative z-10">
        <div className="border-4 border-white bg-black p-2 inline-block">
          <div
            className="text-7xl leading-none tracking-tight tabular-nums text-white"
            style={{ fontFamily: 'VT323, monospace', textShadow: '0 0 10px #fff' }}
          >
            {avgBpm || '--'}
          </div>
        </div>
        <div className="text-white/70 text-sm tracking-widest mt-2 font-mono">
          ░▒▓ AVG BPM ▓▒░
        </div>
      </div>

      {/* Key Display */}
      <div className="text-right relative z-10">
        <div className="border-4 border-gray-400 bg-black p-2 inline-block">
          <div
            className="text-6xl leading-none tabular-nums text-gray-300"
            style={{ fontFamily: 'VT323, monospace' }}
          >
            {dominantKey}
          </div>
        </div>
        <div className="text-gray-400/70 text-sm tracking-widest mt-2 font-mono">
          ░▒▓ DOMINANT KEY ▓▒░
        </div>
      </div>

      {/* Intensity */}
      <div className="mt-4 relative z-10">
        <div className="flex items-center justify-between mb-2 border-2 border-white/30 px-2 py-1 bg-black/60">
          <span className="text-white text-sm font-mono">[{vibe.toUpperCase()}]</span>
          <span className="text-gray-400 text-xs font-mono">TEXTURE</span>
        </div>
      </div>
    </div>
  );
}
