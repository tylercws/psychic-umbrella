import { Gauge, Library, Activity, Settings, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { id: 'dashboard', icon: Gauge, label: 'DASHBOARD', active: true },
  { id: 'library', icon: Library, label: 'LIBRARY', active: false },
  { id: 'analyze', icon: Activity, label: 'ANALYZE', active: false },
  { id: 'settings', icon: Settings, label: 'SETTINGS', active: false },
  { id: 'recent', icon: RotateCcw, label: 'RECENT', active: false },
];

export function BottomNav() {
  return (
    <div className="border-t-4 border-double border-white/40 bg-black/90 relative overflow-hidden">
      {/* Moving ASCII top decoration */}
      <motion.div 
        className="absolute top-0 left-0 right-0 h-1 text-[8px] leading-none text-white/40 overflow-hidden"
        style={{ fontFamily: 'VT323, monospace' }}
        animate={{ x: [0, -100, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      >
        {('═'.repeat(400))}
      </motion.div>

      <div className="flex items-center justify-around px-8 py-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              className={`relative flex flex-col items-center gap-2 px-6 py-3 transition-all ${
                item.active 
                  ? 'border-4 border-white bg-black text-white' 
                  : 'border-4 border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-700'
              }`}
              style={{
                imageRendering: 'pixelated',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={item.active ? {
                boxShadow: ['0 0 10px rgba(255,255,255,0.5)', '0 0 20px rgba(255,255,255,0.8)', '0 0 10px rgba(255,255,255,0.5)']
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Corner brackets for active item */}
              {item.active && (
                <>
                  <motion.div 
                    className="absolute top-0 left-0 text-white text-sm" 
                    style={{ fontFamily: 'VT323, monospace' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ┌
                  </motion.div>
                  <motion.div 
                    className="absolute top-0 right-0 text-white text-sm" 
                    style={{ fontFamily: 'VT323, monospace' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  >
                    ┐
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-0 left-0 text-white text-sm" 
                    style={{ fontFamily: 'VT323, monospace' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  >
                    └
                  </motion.div>
                  <motion.div 
                    className="absolute bottom-0 right-0 text-white text-sm" 
                    style={{ fontFamily: 'VT323, monospace' }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                  >
                    ┘
                  </motion.div>
                </>
              )}

              <motion.div
                animate={item.active ? {
                  filter: ['drop-shadow(0 0 5px #ffffff)', 'drop-shadow(0 0 15px #ffffff)', 'drop-shadow(0 0 5px #ffffff)']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ 
                    imageRendering: 'pixelated',
                  }} 
                />
              </motion.div>
              <span 
                className="text-[10px] tracking-widest" 
                style={{ 
                  fontFamily: 'VT323, monospace',
                  textShadow: item.active ? '0 0 5px #ffffff' : 'none',
                }}
              >
                [{item.label}]
              </span>

              {/* Blinking cursor for active */}
              {item.active && (
                <motion.div
                  className="absolute -right-2 top-1/2 -translate-y-1/2 text-white"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ fontFamily: 'VT323, monospace' }}
                >
                  █
                </motion.div>
              )}

              {/* Index number */}
              <motion.div 
                className="absolute -top-2 -left-2 text-[8px] text-gray-600"
                style={{ fontFamily: 'VT323, monospace' }}
                animate={item.active ? {
                  color: ['#666666', '#ffffff', '#666666']
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {index + 1}
              </motion.div>
            </motion.button>
          );
        })}
      </div>

      {/* Moving scanlines */}
      <motion.div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)',
        }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
