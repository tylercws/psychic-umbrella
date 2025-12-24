import { motion } from 'motion/react';

import { Link } from 'react-router-dom';
import { GlassPanel } from './ui/GlassPanel';
import { GlassChip } from './ui/GlassChip';
import { motionTokens } from '../motionTokens';

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
              className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
              variants={motionTokens.bento}
              initial="hidden"
              animate="show"
              layoutId={`scan-card-${i}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <motion.div
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/50 via-purple-500/30 to-transparent border border-white/10 shadow-lg"
                  layoutId={`scan-cover-${i}`}
                />
                <div className="flex flex-col overflow-hidden">
                  <motion.span
                    className="text-white text-sm font-medium truncate max-w-[100px]"
                    layoutId={`scan-title-${i}`}
                  >
                    {track.meta?.title || "Unknown"}
                  </motion.span>
                  <span className="text-white/40 text-[10px] tracking-wide uppercase">{track.texture}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white font-mono">
                  {track.key}
                </div>
                <div className="flex gap-[2px] items-center h-4">
                  {[3, 6, 4, 8, 5].map((h, k) => (
                    <div key={k} className="w-[2px] bg-white/60 rounded-full" style={{ height: `${h + 2}px` }} />
                  ))}
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
