import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export function SystemStats() {
  const [time, setTime] = useState('23:45:12');
  const [cpu, setCpu] = useState(18);
  const [ram, setRam] = useState(4.268);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toTimeString().split(' ')[0]);
      
      // Simulate CPU fluctuation
      setCpu(Math.floor(15 + Math.random() * 10));
      setRam(4.2 + Math.random() * 0.2);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative border-b-4 border-double border-white/40 bg-black/90 overflow-hidden">
      {/* Moving ASCII top border decoration */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 overflow-hidden text-[8px] leading-none text-white/30"
        style={{ fontFamily: 'VT323, monospace' }}
        animate={{ x: [0, -100, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        {('═'.repeat(400))}
      </motion.div>

      <div className="flex items-center justify-between px-8 py-3">
        {/* Title with ASCII decoration */}
        <div className="flex items-center gap-3">
          <motion.span 
            className="text-white text-xl" 
            style={{ fontFamily: 'VT323, monospace' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ▓▓▓
          </motion.span>
          <motion.div 
            className="text-white text-xl tracking-widest" 
            style={{ fontFamily: 'VT323, monospace' }}
            animate={{ textShadow: ['0 0 5px #ffffff', '0 0 15px #ffffff', '0 0 5px #ffffff'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            [GEMINI_DJ_v1.0]
          </motion.div>
          <motion.span 
            className="text-gray-400 text-xl" 
            style={{ fontFamily: 'VT323, monospace' }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          >
            ▓▓▓
          </motion.span>
        </div>
        
        {/* System stats with ASCII boxes */}
        <div className="flex items-center gap-6 text-sm" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
          <motion.div 
            className="border-2 border-white/50 px-3 py-1 bg-black"
            animate={{ borderColor: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0.5)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white">CPU:</span>
            <span className="text-gray-300 ml-2">[{cpu.toString().padStart(2, '0')}%]</span>
          </motion.div>
          <motion.div 
            className="border-2 border-white/50 px-3 py-1 bg-black"
            animate={{ borderColor: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0.5)'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          >
            <span className="text-white">RAM:</span>
            <span className="text-gray-300 ml-2">[{ram.toFixed(3)}B]</span>
          </motion.div>
          <motion.div 
            className="border-2 border-gray-500/50 px-3 py-1 bg-black"
            animate={{ borderColor: ['rgba(128,128,128,0.5)', 'rgba(255,255,255,0.8)', 'rgba(128,128,128,0.5)'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          >
            <span className="text-gray-400">BACKEND:</span>
            <span className="text-white ml-2">[PYTHON_v3.11]</span>
            <motion.span 
              className="text-white ml-2"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ●ONLINE
            </motion.span>
          </motion.div>
          <div className="border-2 border-white/50 px-3 py-1 bg-black">
            <span className="text-gray-400">TIME:</span>
            <span className="text-white ml-2">[{time}]</span>
          </div>
        </div>
      </div>

      {/* Moving ASCII bottom border decoration */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden text-[8px] leading-none text-gray-400/30"
        style={{ fontFamily: 'VT323, monospace' }}
        animate={{ x: [0, 100, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      >
        {('─'.repeat(400))}
      </motion.div>
    </div>
  );
}