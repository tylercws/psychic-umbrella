import { motion } from 'motion/react';

interface StatsPanelProps {
  tracks: any[];
}

export function StatsPanel({ tracks }: StatsPanelProps) {
  // Use the most recent track (first in list) or default values
  const currentTrack = tracks[0] || { bpm: 0, key: '--', texture: 'Waiting...' };

  return (
    <div className="w-64 flex flex-col gap-2">
      <span className="text-white/40 text-xs font-mono tracking-widest ml-1">HUD</span>

      <div className="relative bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        <div className="flex flex-col gap-6 relative z-10">
          <div>
            <motion.div
              className="text-6xl font-bold text-white tracking-tighter leading-none"
              key={currentTrack.bpm}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentTrack.bpm || '--'}
            </motion.div>
            <div className="text-white/40 text-xs font-mono mt-1">BPM</div>
          </div>

          <div>
            <motion.div
              className="text-5xl font-bold text-white tracking-tighter leading-none"
              key={currentTrack.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {currentTrack.key}
            </motion.div>
            <div className="text-white/40 text-xs font-mono mt-1">KEY</div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="text-2xl font-bold text-white tracking-tight leading-none">
              {currentTrack.texture ? currentTrack.texture.toUpperCase() : "IDLE"}
            </div>
            <div className="text-white/40 text-xs font-mono mt-1">VIBE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
