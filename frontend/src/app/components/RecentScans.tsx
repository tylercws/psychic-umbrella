import { motion } from 'motion/react';

import { Link } from 'react-router-dom';
import { GlassPanel } from './ui/GlassPanel';
import { GlassChip } from './ui/GlassChip';

interface Track {
  meta?: { title: string, artist: string };
  bpm: number;
  key: string;
  texture: string;
}

export function RecentScans({ tracks }: { tracks: Track[] }) {
  const displayTracks = tracks.slice(0, 4);

  return (
    <div className="w-64 flex flex-col gap-2">
      <span className="text-white/40 text-xs font-mono tracking-widest ml-1">RECENT SCANS</span>

      <div className="flex flex-col gap-2">
        {displayTracks.map((track, i) => (
          <Link to={`/track/${i}`} state={{ track }} key={i} className="no-underline block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <GlassPanel
                elevation="base"
                tint="violet"
                className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2 transition-transform duration-300 group-hover:-translate-y-0.5"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white text-sm font-medium truncate max-w-[120px]">{track.meta?.title || "Unknown"}</span>
                  <span className="text-white/50 text-[10px] tracking-wide uppercase">{track.texture}</span>
                </div>

                <div className="flex items-center gap-2">
                  <GlassChip
                    as="div"
                    tone="amber"
                    className="px-2 py-1 text-[10px] leading-none"
                  >
                    {track.key}
                  </GlassChip>
                  <div className="flex gap-[2px] items-center h-4">
                    {[3, 6, 4, 8, 5].map((h, k) => (
                      <div key={k} className="w-[2px] bg-white/60 rounded-full" style={{ height: `${h + 2}px` }} />
                    ))}
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          </Link>
        ))}
        {displayTracks.length === 0 && (
          <GlassPanel elevation="base" className="rounded-2xl p-4 text-center text-white/30 text-xs italic border border-white/10">
            No recent scans
          </GlassPanel>
        )}
      </div>
    </div>
  );
}
