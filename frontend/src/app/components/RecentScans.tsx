import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Track {
  meta?: { title: string, artist: string };
  bpm: number;
  key: string;
  texture: string;
}

interface RecentScansProps {
  tracks: Track[];
}

export function RecentScans({ tracks }: RecentScansProps) {
  const displayTracks = tracks.slice(0, 5);

  return (
    <div className="space-y-4 border-4 border-double border-white/40 p-4 bg-black/80 relative overflow-hidden">
      <div className="flex items-center justify-between pt-2">
        <motion.div
          className="text-white text-sm tracking-widest border-2 border-white/50 px-3 py-1 bg-black"
          style={{ fontFamily: 'VT323, monospace' }}
        >
          [RECENT_SCANS]
        </motion.div>
      </div>

      <div className="space-y-3">
        {displayTracks.length === 0 ? (
          <div className="text-gray-500 text-xs text-center py-4 font-mono">NO DATA - AWAITING INPUT</div>
        ) : (
          displayTracks.map((track, index) => (
            <Link to={`/track/${index}`} state={{ track }} key={index} className="block group relative no-underline">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                layoutId={`track-container-${index}`}
              >
                <motion.div
                  className="text-white text-xs mb-2 truncate flex items-center gap-2"
                  style={{ fontFamily: 'Share Tech Mono, monospace' }}
                  layoutId={`track-title-${index}`}
                >
                  <span className="text-gray-400">►</span>
                  {track.meta?.title || "Unknown Track"}
                </motion.div>

                <motion.div
                  className="relative border-4 border-white/30 bg-black overflow-hidden group-hover:border-white transition-colors h-16 flex items-center justify-between px-4"
                  whileHover={{ scale: 1.02 }}
                  layoutId={`track-stats-${index}`}
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-mono">BPM</span>
                      <span className="text-white text-xl font-bold font-mono leading-none">{track.bpm}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-mono">KEY</span>
                      <span className="text-cyan-300 text-xl font-bold font-mono leading-none">{track.key}</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
