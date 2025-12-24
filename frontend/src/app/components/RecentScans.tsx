import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { fadeSlideVariants } from '../motion/motionTokens';

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
              layoutId={`track-container-${i}`}
              variants={fadeSlideVariants.cardLift}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: i * 0.05 }}
              className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex flex-col overflow-hidden">
                <motion.span
                  layoutId={`track-title-${i}`}
                  className="text-white text-sm font-medium truncate max-w-[100px]"
                >
                  {track.meta?.title || "Unknown"}
                </motion.span>
                <motion.span
                  layoutId={`track-texture-${i}`}
                  className="text-white/40 text-[10px] tracking-wide uppercase"
                  variants={fadeSlideVariants.fadeInUp}
                >
                  {track.texture}
                </motion.span>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2 py-1 rounded-md bg-white/10 text-[10px] text-white font-mono">
                  {track.key}
                </div>
                {/* Simple fake waveform icon */}
                <motion.div
                  className="flex gap-[2px] items-center h-4"
                  layoutId={`track-waveform-${i}`}
                >
                  {[3, 6, 4, 8, 5].map((h, k) => (
                    <div key={k} className="w-[2px] bg-white/60 rounded-full" style={{ height: `${h + 2}px` }} />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </Link>
        ))}
        {displayTracks.length === 0 && (
          <div className="p-4 text-center text-white/20 text-xs italic border border-white/5 rounded-xl">No recent scans</div>
        )}
      </div>
    </div>
  );
}
