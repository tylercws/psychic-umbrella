import { motion } from 'motion/react';
import { useState } from 'react';

interface CircularVisualizerProps {
  onFile: (file: File) => void;
  isAnalyzing: boolean;
  progressMessage: string;
}

export function CircularVisualizer({ onFile, isAnalyzing, progressMessage }: CircularVisualizerProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  // ASCII art sphere
  const asciiSphere = [
    "        ████████████████        ",
    "    ████░░░░░░░░░░░░░░░░████    ",
    "  ██░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░██  ",
    " ██░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░██ ",
    "██░░▒▒▓▓████████████████▓▓▒▒░░██",
    "██░▒▓▓██░░░░░░░░░░░░░░░░██▓▓▒░██",
    "██░▒▓██░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░██▓▒░██",
    "██▒▓██░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░██▓▒██",
    "██▒▓██░▒▓████████████████▓▒░██▓▒██",
    "██▒▓██░▒▓█ DRAG  AUDIO █▓▒░██▓▒██",
    "██▒▓██░▒▓████████████████▓▒░██▓▒██",
    "██▒▓██░░▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒░░██▓▒██",
    "██░▒▓██░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░██▓▒░██",
    "██░▒▓▓██░░░░░░░░░░░░░░░░██▓▓▒░██",
    "██░░▒▒▓▓████████████████▓▓▒▒░░██",
    " ██░░▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒░░██ ",
    "  ██░░░░▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░██  ",
    "    ████░░░░░░░░░░░░░░░░████    ",
    "        ████████████████        ",
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isAnalyzing && e.dataTransfer.files?.[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Animated ASCII Corner decorations */}
      <motion.div
        className="absolute -top-8 -left-8 text-white opacity-60 text-xs"
        style={{ fontFamily: 'VT323, monospace' }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ╔═══════════════╗
      </motion.div>
      {/* ... keeping other decorations same ... */}

      {/* Main ASCII sphere container */}
      <motion.div
        className={`relative border-4 border-double transition-all duration-300 ${isDragOver || isAnalyzing ? 'border-white scale-105' : 'border-gray-500/50'
          }`}
        style={{
          borderStyle: 'double',
          boxShadow: isDragOver || isAnalyzing
            ? '0 0 20px #ffffff, inset 0 0 20px #ffffff'
            : '0 0 10px #888888, inset 0 0 10px #888888',
          imageRendering: 'pixelated',
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

        {/* ASCII Content */}
        <div
          className="bg-black p-4 cursor-pointer"
          style={{ fontFamily: 'VT323, monospace', lineHeight: '1.2' }}
        >
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full py-10 w-64 text-center">
              <span className="text-white animate-pulse mb-2">SCANNING...</span>
              <span className="text-green-400 text-sm">{progressMessage}</span>
            </div>
          ) : (
            asciiSphere.map((line, i) => (
              <motion.div
                key={i}
                className="whitespace-pre text-xs"
                style={{
                  color: i === 9 ? '#ffffff' : '#cccccc',
                  textShadow: i === 9 ? '0 0 5px #ffffff' : '0 0 3px #cccccc',
                }}
              >
                {line}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
