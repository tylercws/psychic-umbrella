import { motion } from 'motion/react';
import { useState } from 'react';
import { fadeSlideVariants } from '../motion/motionTokens';

interface CircularVisualizerProps {
  onFile: (file: File) => void;
  isAnalyzing: boolean;
  progressMessage: string;
}

export function CircularVisualizer({ onFile, isAnalyzing, progressMessage }: CircularVisualizerProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isAnalyzing && e.dataTransfer.files?.[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center perspective-[1000px]">

      {/* Wireframe Sphere Effect */}
      <motion.div
        className="absolute inset-0 rounded-full border border-white/10"
        animate={{ rotateY: 360, rotateX: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute inset-0 rounded-full border border-white/10" style={{ transform: `rotateY(${i * 30}deg)` }} />
        ))}
        {[...Array(6)].map((_, i) => (
          <div key={`h-${i}`} className="absolute inset-0 rounded-full border border-white/10" style={{ transform: `rotateX(${i * 30}deg)` }} />
        ))}
      </motion.div>

      {/* Inner Glow Sphere */}
      <div className="absolute inset-20 rounded-full bg-white/5 blur-3xl pointer-events-none" />

      {/* Drop Zone Card */}
      <motion.div
        variants={fadeSlideVariants.cardLift}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        className={`
          relative z-10 w-80 h-48 rounded-2xl backdrop-blur-xl border transition-all duration-300
          flex flex-col items-center justify-center gap-4 cursor-pointer
          ${isDragOver ? 'bg-white/10 scale-105 border-white/50' : 'bg-black/20 border-white/20'}
        `}
        style={{
          boxShadow: '0 0 40px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.05)'
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          type="file"
          id="file-input"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          accept=".mp3,.wav,.m4a,.flac"
        />

        {isAnalyzing ? (
          <div className="flex flex-col items-center gap-2 w-full px-8">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-white/60 text-sm font-mono tracking-widest uppercase">{progressMessage}</span>
          </div>
        ) : (
          <>
            <div className="text-white text-lg font-medium tracking-wide">Drop Audio Source</div>
            <div className="text-white/40 text-xs uppercase tracking-widest">or click to browse</div>
          </>
        )}
      </motion.div>
    </div>
  );
}
