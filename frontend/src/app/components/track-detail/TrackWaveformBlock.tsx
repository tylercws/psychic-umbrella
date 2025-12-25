import { AnimatePresence, motion } from "motion/react";
import {
  Music,
  Orbit,
  Sparkles,
  Triangle,
  Waves as WavesIcon,
} from "lucide-react";
import { WaveformVisualization } from "../WaveformVisualization";
import { GlassPanel } from "../ui/GlassPanel";
import { trackDetailMotion } from "./trackDetailMotion";
import { Cue } from "./types";

interface TrackWaveformBlockProps {
  waveformPoints: number[];
  cues: Cue[];
  stems?: Record<string, number[]>;
  stemUrls?: Record<string, string>;
  midiUrls?: Record<string, string | undefined>;
  audioUrl?: string;
  vocalUrl?: string;
  percUrl?: string;
  selectedCue: Cue | null;
  onCueClick: (cue: Cue) => void;
  formatTime: (seconds?: number | string) => string;
  layoutId?: string;
}

export function TrackWaveformBlock({
  waveformPoints,
  cues,
  stems,
  stemUrls,
  midiUrls,
  audioUrl,
  vocalUrl,
  percUrl,
  selectedCue,
  onCueClick,
  formatTime,
  layoutId,
}: TrackWaveformBlockProps) {
  return (
    <>
      <motion.div
        className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)] flex items-center justify-between gap-4"
        variants={trackDetailMotion.glass}
        initial="hidden"
        animate="show"
        layoutId={`track-header-${layoutId}`}
      >
        <div className="flex items-center gap-3">
          <WavesIcon className="w-5 h-5 text-cyan-300" />
          <div className="font-mono text-xs text-gray-400">
            <div className="text-white text-lg font-bold">LIQUID_WAVEFORM</div>
            <div>{waveformPoints.length} data points</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <Orbit className="w-4 h-4 text-purple-400" />
          <span>PARALLAX_ACTIVE</span>
        </div>
      </motion.div>

      <div className="flex-1 min-h-0 grid grid-rows-[minmax(0,1fr)_auto] gap-4">
        <WaveformVisualization
          data={waveformPoints}
          cues={cues}
          stems={stems}
          stemUrls={stemUrls}
          midiUrls={midiUrls}
          audioUrl={audioUrl}
          vocalUrl={vocalUrl}
          percUrl={percUrl}
          onCueClick={onCueClick}
          layoutId={`wave-ribbon-${layoutId}`}
        />

        <AnimatePresence mode="wait">
          {selectedCue ? (
            <motion.div
              key={selectedCue.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassPanel
                elevation="raised"
                tint="violet"
                className="overflow-hidden rounded-2xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full shadow-[0_0_12px_currentColor]"
                        style={{
                          backgroundColor: selectedCue.color,
                          color: selectedCue.color,
                        }}
                      />
                      <span className="text-xs text-gray-500 font-mono">
                        {selectedCue.type === "range"
                          ? "SECTION_INTEL"
                          : "MIX_POINT_INTEL"}
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold text-white tracking-tight">
                      {selectedCue.label}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 font-mono">
                      {selectedCue.type === "range" ? "DURATION" : "TIMESTAMP"}
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      {selectedCue.type === "range"
                        ? `${selectedCue.duration}s`
                        : selectedCue.time}
                    </div>
                    {selectedCue.type === "range" && (
                      <div className="text-[10px] text-gray-600 font-mono">
                        ENDS @ {formatTime(selectedCue.endTime)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 text-sm font-mono text-gray-400 grid grid-cols-3 gap-8">
                  <div>
                    <p className="text-[10px] text-gray-600 mb-1">
                      STEM_DENSITY
                    </p>
                    <p className="text-white text-xs">
                      {selectedCue.label.includes("CHORUS")
                        ? "CRITICAL (95%)"
                        : "STABLE (64%)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-1">
                      PITCH_VARIANCE
                    </p>
                    <p className="text-white text-xs">DYNAMIC_SHIFT</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-1">
                      LYRICAL_PROBABILITY
                    </p>
                    <p className="text-white text-xs text-green-400">
                      VERIFIED_VOCAL
                    </p>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GlassPanel
                elevation="base"
                className="h-24 rounded-2xl border border-dashed border-white/10 flex items-center justify-center"
              >
                <span className="text-gray-600 font-mono text-xs animate-pulse">
                  :: CLICK_WAVEFORM_MARKER_FOR_INTEL ::
                </span>
              </GlassPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
