import { motion } from 'motion/react';

export function DashboardBrand() {
  const text = "GEMINI DJ";

  return (
    <div
      className="fixed left-0 top-0 bottom-0 flex items-center justify-center w-40 pointer-events-none z-0"
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
      }}

    >
      <div className="relative">
        <motion.h1
          className="text-8xl font-black text-white leading-none tracking-tighter opacity-20"
          style={{ fontFamily: 'Inter, sans-serif', transform: 'rotate(180deg)' }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.2, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {text}
        </motion.h1>
      </div>


    </div>
  )

}
