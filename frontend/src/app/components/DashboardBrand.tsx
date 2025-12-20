import { motion } from 'motion/react';

export function DashboardBrand() {
  const text = "DASHBOARD";
  
  return (
    <div 
      className="fixed left-0 top-0 bottom-0 flex items-center justify-center w-32 pointer-events-none border-r-4 border-double border-white/30 bg-black/50 overflow-hidden"
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}
    >
      {/* Moving scanlines */}
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #fff 2px, #fff 4px)',
        }}
        animate={{ x: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* ASCII decoration top */}
      <motion.div 
        className="absolute top-4 left-1/2 -translate-x-1/2 text-white opacity-60" 
        style={{ fontFamily: 'VT323, monospace', writingMode: 'horizontal-tb' }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        ╔═══╗
      </motion.div>

      {/* Main text */}
      <div className="relative">
        {text.split('').map((char, i) => (
          <motion.span
            key={i}
            className="inline-block text-6xl border-2 border-white/30 bg-black px-1 my-1"
            style={{
              fontFamily: 'VT323, monospace',
              color: i % 2 === 0 ? '#ffffff' : '#cccccc',
              textShadow: `0 0 10px ${i % 2 === 0 ? '#ffffff' : '#cccccc'}`,
              imageRendering: 'pixelated',
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.7, 1, 0.7],
              textShadow: [
                `0 0 10px ${i % 2 === 0 ? '#ffffff' : '#cccccc'}`,
                `0 0 20px ${i % 2 === 0 ? '#ffffff' : '#cccccc'}`,
                `0 0 10px ${i % 2 === 0 ? '#ffffff' : '#cccccc'}`
              ]
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              repeat: Infinity,
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* ASCII decoration bottom */}
      <motion.div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-gray-400 opacity-60" 
        style={{ fontFamily: 'VT323, monospace', writingMode: 'horizontal-tb' }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
      >
        ╚═══╝
      </motion.div>

      {/* Rotating dithering pattern overlay */}
      <motion.div
        className="absolute top-0 left-0 w-full h-32 opacity-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#dither-light)" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-32 opacity-10"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <svg width="100%" height="100%">
          <rect width="100%" height="100%" fill="url(#dither-medium)" />
        </svg>
      </motion.div>

      {/* Blinking indicators */}
      <motion.div
        className="absolute top-2 left-2 w-2 h-2 bg-white border border-white"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        style={{ imageRendering: 'pixelated' }}
      />
      <motion.div
        className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 border border-white"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Moving vertical lines */}
      <motion.div
        className="absolute left-0 w-1 h-full bg-gradient-to-b from-transparent via-white to-transparent opacity-30"
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
