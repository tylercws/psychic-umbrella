import { motion } from "motion/react";
import { Music, Sparkles } from "lucide-react";
import { trackDetailMotion } from "./trackDetailMotion";
import { Cue } from "./types";
import { renderBar } from "./trackDetailUtils";

interface TrackCueListProps {
  cues: Cue[];
  onSelectCue: (cue: Cue) => void;
  stems?: Record<string, number[]>;
  danceability?: number;
  loudness?: number;
}

export function TrackCueList({
  cues,
  onSelectCue,
  stems,
  danceability = 0,
  loudness = 0,
}: TrackCueListProps) {
  return (
    <motion.div
      className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0"
      variants={trackDetailMotion.panel}
    >
      <div className="border border-white/10 bg-white/5 rounded-2xl p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 font-mono">
            :: DETECTED_CUE_POINTS ::
          </span>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        <div className="flex flex-col gap-2 overflow-auto pr-1 min-h-0">
          {cues?.length ? (
            cues.map((cue) => (
              <motion.button
                key={cue.id}
                onClick={() => onSelectCue(cue)}
                className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-md group hover:border-white/30 transition-colors cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                whileHover="hover"
                variants={trackDetailMotion.float}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]"
                    style={{ backgroundColor: cue.color, color: cue.color }}
                  ></div>
                  <div className="font-mono text-lg font-bold text-white">
                    {cue.time}
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 font-mono tracking-wider ml-1">
                  {cue.label}
                </div>
              </motion.button>
            ))
          ) : (
            <div className="text-gray-600 font-mono text-sm italic">
              NO_CUES_DETECTED
            </div>
          )}
        </div>
      </div>

      <div className="border border-white/10 bg-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 font-mono">STEM_CHANNELS</span>
          <Music className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(stems ? Object.keys(stems) : ["vocal", "bass", "kick", "hihats", "piano", "guitar", "other"]).map((stem) => (
            <div
              key={stem}
              className="flex items-center gap-2 px-2 py-2 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-gray-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
              <span className="uppercase tracking-widest">{stem}</span>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-gray-500 font-mono">
          Toggle stems in the dock to isolate components.
        </div>
      </div>

      <div className="border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent rounded-2xl p-4 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 font-mono">
            LOUDNESS / DANCEABILITY
          </span>
          <Sparkles className="w-4 h-4 text-pink-400" />
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1 font-mono text-gray-400">
            <span>DANCEABILITY</span>
            <span>{danceability}%</span>
          </div>
          <div className="text-purple-400 font-mono text-sm tracking-wider whitespace-nowrap overflow-hidden">
            {renderBar(danceability || 0)}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1 font-mono text-gray-400">
            <span>LOUDNESS (LUFS)</span>
            <span>{loudness} dB</span>
          </div>
          <div className="text-orange-400 font-mono text-sm tracking-widest break-all whitespace-nowrap overflow-hidden">
            {renderBar(Math.min(100, (loudness + 30) * 3))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
