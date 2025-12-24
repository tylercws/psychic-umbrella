import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react';
import { forwardRef, useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type PointerEvent } from 'react';

const GlassPanel = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function GlassPanel({ className = '', ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] ${className}`}
      {...props}
    />
  );
});

const MotionGlassPanel = motion.create(GlassPanel);

interface CircularVisualizerProps {
  onFile: (file: File) => void;
  isAnalyzing: boolean;
  progressMessage: string;
}

export function CircularVisualizer({ onFile, isAnalyzing, progressMessage }: CircularVisualizerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 180, damping: 18, mass: 0.6 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 18, mass: 0.6 });

  useEffect(() => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      pointerX.set(rect.width / 2);
      pointerY.set(rect.height / 2);
    }
  }, [pointerX, pointerY]);

  const highlight = useMotionTemplate`radial-gradient(140px at ${springX}px ${springY}px, rgba(255,255,255,0.35), rgba(120,188,255,0.18), transparent 70%)`;
  const lens = useMotionTemplate`radial-gradient(220px at ${springX}px ${springY}px, rgba(129, 255, 255, 0.5), rgba(120, 120, 255, 0.25), transparent 70%)`;

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isAnalyzing && e.dataTransfer.files?.[0]) {
      onFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const openFilePicker = () => {
    if (!isAnalyzing) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFilePicker();
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointerX.set(x);
    pointerY.set(y);
  };

  const handlePointerLeave = () => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      pointerX.set(rect.width / 2);
      pointerY.set(rect.height / 2);
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

      {/* Orbiting Rings */}
      <motion.div
        layoutId="portal-ring"
        className="absolute inset-[-48px] rounded-full border border-white/15"
        animate={{ rotate: 360, scale: isDragOver ? 1.05 : 1 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ boxShadow: '0 0 120px rgba(60,120,255,0.15)' }}
      />
      <motion.div
        className="absolute inset-[-32px] rounded-full border border-white/10"
        animate={{ rotate: -360, opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-[-16px] rounded-full border border-white/5"
        animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Drop Zone Card */}
      <MotionGlassPanel
        ref={cardRef}
        layoutId="portal-card"
        className={`
          relative z-10 w-80 h-52 overflow-hidden border-white/20
          transition-all duration-300 cursor-pointer
          ${isDragOver ? 'border-white/50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={openFilePicker}
        onKeyDown={handleKeyDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        role="button"
        tabIndex={0}
        aria-label="Drop or browse for an audio file"
        aria-disabled={isAnalyzing}
        aria-busy={isAnalyzing}
        whileHover={{ rotateX: -5, rotateY: 5, scale: 1.02 }}
        animate={{ scale: isDragOver ? 1.04 : 1, filter: isDragOver ? 'blur(2px)' : 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 150, damping: 16, mass: 0.8 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="file-input"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          accept=".mp3,.wav,.m4a,.flac"
        />

        {/* Liquid Lens Core */}
        <motion.div
          className="absolute inset-6 rounded-2xl mix-blend-screen pointer-events-none"
          style={{ backgroundImage: lens }}
          animate={{
            rotate: isAnalyzing ? 6 : 0,
            scale: isDragOver ? 1.08 : 1,
            filter: isDragOver ? 'blur(24px)' : 'blur(12px)',
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />

        {/* Specular Highlight */}
        <motion.div
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ backgroundImage: highlight, mixBlendMode: 'screen', opacity: 0.9 }}
          animate={{ opacity: isDragOver ? 1 : 0.8 }}
        />

        {/* Glass Texture */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-white/5" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(120,200,255,0.12),transparent_30%)]" />

        <div className="relative z-10 flex flex-col items-center justify-center gap-3 h-full text-center px-6">
          {isAnalyzing ? (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              </div>
              <span className="text-white/70 text-sm font-mono tracking-widest uppercase">{progressMessage}</span>
            </div>
          ) : (
            <>
              <div className="text-white text-lg font-semibold tracking-wide drop-shadow-lg">Drop Audio Source</div>
              <div className="text-white/60 text-xs uppercase tracking-[0.3em]">or press enter to browse</div>
            </>
          )}
        </div>
      </MotionGlassPanel>
    </div>
  );
}
