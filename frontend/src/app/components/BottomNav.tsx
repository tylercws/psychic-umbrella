import { Home, Music, Play, Settings, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react'

export function BottomNav() {
  const items = [
    { icon: Home, active: false },
    { icon: Music, active: false },
    { icon: Play, active: true, highlight: true },
    { icon: Settings, active: false },
    { icon: MoreHorizontal, active: false },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 p-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
        {items.map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-12 h-12 flex items-center justify-center rounded-full transition-all cursor-pointer
              ${item.highlight ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-white/60 hover:text-white hover:bg-white/10'}
            `}
          >
            <item.icon className="w-5 h-5" fill={item.highlight ? "currentColor" : "none"} />
          </motion.button>
        ))}
      </div>

    </div>
  );
}
