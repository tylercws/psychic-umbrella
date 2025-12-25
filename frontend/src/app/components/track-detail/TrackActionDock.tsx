import { motion } from "motion/react";
import {
  Disc,
  Play,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { trackDetailMotion } from "./trackDetailMotion";

interface TrackActionDockProps {
  isAnalyzing: boolean;
  meta?: { filename?: string };
  progressMessage: string;
  onReAnalyze: (filename: string, model: string) => void;
  autoReveal: boolean;
  setAutoReveal: (value: boolean) => void;
  showDust: boolean;
  setShowDust: (value: boolean) => void;
}

export function TrackActionDock({
  isAnalyzing,
  meta,
  progressMessage,
  onReAnalyze,
  autoReveal,
  setAutoReveal,
  showDust,
  setShowDust,
}: TrackActionDockProps) {
  return (
    <motion.div
      className="fixed inset-x-4 bottom-24 lg:inset-auto lg:right-10 lg:bottom-24 z-30"
      variants={trackDetailMotion.glass}
      initial="hidden"
      animate="show"
    >
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-4 flex flex-col gap-3 w-full max-w-xl lg:max-w-xs mx-auto">
        <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
          <span>RE-ANALYZE</span>
          <span className="text-[10px] text-gray-500">htdemucs_ft</span>
        </div>
        <motion.button
          onClick={() => !isAnalyzing && meta?.filename && onReAnalyze(meta.filename, "htdemucs_ft")}
          disabled={isAnalyzing || !meta?.filename}
          className={`w-full py-3 px-4 border border-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-3
              ${(isAnalyzing || !meta?.filename)
                ? "border-yellow-500/50 text-yellow-500/50 cursor-not-allowed"
                : "border-white/30 text-white hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/5"}`}
          whileHover={{ scale: isAnalyzing || !meta?.filename ? 1 : 1.02 }}
          whileTap={{ scale: isAnalyzing || !meta?.filename ? 1 : 0.98 }}
        >
          {isAnalyzing ? (
            <>
              <Disc className="w-4 h-4 animate-spin" />
              <span>{progressMessage || "PROCESSING..."}</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>RUN STEM SPLIT</span>
            </>
          )}
        </motion.button>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400">
          <button
            onClick={() => setAutoReveal(!autoReveal)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/15 hover:border-white/40 transition-colors"
          >
            {autoReveal ? (
              <ToggleRight className="w-4 h-4 text-cyan-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-500" />
            )}
            <span>AUTO_REVEAL</span>
          </button>
          <button
            onClick={() => setShowDust(!showDust)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/15 hover:border-white/40 transition-colors"
          >
            {showDust ? (
              <ToggleRight className="w-4 h-4 text-purple-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-gray-500" />
            )}
            <span>DUST_LAYER</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
