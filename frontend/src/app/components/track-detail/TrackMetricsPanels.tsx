import { motion } from "motion/react";
import { GlassPanel } from "../ui/GlassPanel";
import { GlassChip } from "../ui/GlassChip";
import { trackDetailMotion } from "./trackDetailMotion";
import { MixPoints, TrackDescriptors } from "./types";
import { renderBar, formatTime } from "./trackDetailUtils";

interface TrackMetricsPanelsProps {
  mixPoints?: MixPoints;
  descriptors?: TrackDescriptors;
  danceability?: number;
  loudness?: number;
  texture?: string;
  color?: string;
}

export function TrackMetricsPanels({
  mixPoints,
  descriptors,
  danceability = 0,
  loudness = 0,
  texture,
  color,
}: TrackMetricsPanelsProps) {
  return (
    <>
      <motion.div
        className="grid grid-cols-3 gap-4 rounded-2xl border border-green-500/30 bg-black/70 p-6 font-mono text-green-400 text-sm shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        variants={trackDetailMotion.panel}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="space-y-2">
          <div className="text-gray-400 text-xs">INTRO_END</div>
          <div className="text-3xl font-bold">
            {formatTime(mixPoints?.intro_end) || "--:--"}
          </div>
        </div>
        <div className="space-y-2 text-red-400">
          <div className="text-red-300 text-xs">DROP_DETECTED</div>
          <div className="text-4xl font-bold animate-pulse">
            {mixPoints?.drop || "--:--"}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-gray-400 text-xs">OUTRO_START</div>
          <div className="text-3xl font-bold">
            {formatTime(mixPoints?.outro_start) || "--:--"}
          </div>
        </div>
        <div className="col-span-3 text-xs opacity-80 pt-4 border-t border-green-500/20">
          <p>{`> STRUCTURE SEQUENCING :: OK`}</p>
          <p>{`> INTRO COMPATIBILITY :: 98%`}</p>
          <p>{`> DROP IMPACT :: ${mixPoints?.drop || "UNKNOWN"}`}</p>
        </div>
      </motion.div>

      <div className="flex-1 grid grid-cols-2 gap-6">
        <motion.div
          variants={trackDetailMotion.item}
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <GlassPanel
            elevation="raised"
            tint="violet"
            className="flex h-full flex-col justify-center gap-6 rounded-2xl p-6"
          >
            <div>
              <div className="flex justify-between text-sm mb-2 font-mono text-gray-400">
                <span>DANCEABILITY</span>
                <span>{danceability}%</span>
              </div>
              <div className="text-purple-300 font-mono text-sm tracking-wider whitespace-nowrap overflow-hidden">
                {renderBar(danceability || 0)}
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 font-mono text-gray-400">
                <span>LOUDNESS (LUFS)</span>
                <span>{loudness} dB</span>
              </div>
              <div className="text-orange-300 font-mono text-sm tracking-widest break-all whitespace-nowrap overflow-hidden">
                {renderBar(Math.min(100, (loudness + 30) * 3))}
              </div>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div
          variants={trackDetailMotion.item}
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <GlassPanel
            elevation="raised"
            tint="amber"
            className="flex h-full flex-col justify-center space-y-6 rounded-2xl p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 text-xs text-gray-500 font-mono">TEXTURE</div>
              <GlassChip
                as="div"
                tone="cyan"
                className="flex-1 justify-center rounded-xl px-3 py-2 text-sm font-bold"
              >
                {texture?.toUpperCase()}
              </GlassChip>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 text-xs text-gray-500 font-mono">COLOR</div>
              <GlassChip
                as="div"
                tone="violet"
                className="flex-1 justify-center rounded-xl px-3 py-2 text-sm font-bold"
              >
                {color?.toUpperCase()}
              </GlassChip>
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      <motion.div
        variants={trackDetailMotion.item}
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <GlassPanel
          elevation="raised"
          tint="neutral"
          className="mt-6 flex w-full items-center justify-between rounded-2xl p-6"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-mono">
              DYNAMIC_RANGE
            </span>
            <span className="text-xl font-bold font-mono text-cyan-300">
              {descriptors?.dynamic_range || "--"} dB
            </span>
            <span className="text-[10px] text-gray-600">CREST FACTOR</span>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs text-gray-500 font-mono">
              SONIC_DEFINITION
            </span>
            <span className="text-xl font-bold font-mono text-yellow-300">
              {descriptors?.contrast || "--"}
            </span>
            <span className="text-[10px] text-gray-600">
              SPECTRAL CONTRAST
            </span>
          </div>
        </GlassPanel>
      </motion.div>
    </>
  );
}
