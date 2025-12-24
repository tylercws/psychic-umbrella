import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { SystemStats } from '../components/SystemStats';
import { CircularVisualizer } from '../components/CircularVisualizer';
import { StatsPanel } from '../components/StatsPanel';
import { RecentScans } from '../components/RecentScans';
import { BottomNav } from '../components/BottomNav';
import { DashboardBrand } from '../components/DashboardBrand';
import { fadeSlideVariants, parallaxDepth } from '../motion/motionTokens';

interface DashboardProps {
    tracks: any[];
    handleFile: (file: File) => void;
    analyzing: boolean;
    progressMessage: string;
    selectedModel: "htdemucs_6s" | "htdemucs_ft";
    setSelectedModel: (m: "htdemucs_6s" | "htdemucs_ft") => void;
}

export default function Dashboard({ tracks, handleFile, analyzing, progressMessage, selectedModel, setSelectedModel }: DashboardProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ["start start", "end start"],
    });

    const gridParallax = useTransform(scrollYProgress, [0, 1], [0, -120 * parallaxDepth.mid]);
    const particleParallax = useTransform(scrollYProgress, [0, 1], [0, -160 * parallaxDepth.deep]);
    const gridY = useSpring(gridParallax, { stiffness: 80, damping: 24, mass: 0.8 });
    const particlesY = useSpring(particleParallax, { stiffness: 80, damping: 26, mass: 0.8 });

    return (
        <div ref={scrollRef} className="relative flex flex-col h-screen ml-32 overflow-hidden">
            {/* Top system stats */}
            <SystemStats />

            {/* Parallax backdrops */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    y: gridY,
                    backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0,255,255,0.06), transparent 32%), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: "100% 100%, 100% 100%, 80px 80px, 80px 80px",
                    willChange: "transform",
                }}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                    y: particlesY,
                    backgroundImage: `radial-gradient(2px 2px at 10% 30%, rgba(255,255,255,0.35), transparent), radial-gradient(3px 3px at 60% 80%, rgba(0,255,255,0.35), transparent), radial-gradient(2px 2px at 90% 50%, rgba(255,0,153,0.35), transparent)`,
                    backgroundSize: "200px 200px",
                    mixBlendMode: "screen",
                    willChange: "transform",
                }}
            />

            {/* Main content area */}
            <motion.div
                className="flex-1 flex items-center justify-between px-8 py-8 gap-12 relative"
                variants={fadeSlideVariants.fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.12, delayChildren: 0.16 }}
            >
                {/* Left spacer with moving ASCII decoration */}
                <motion.div
                    className="w-48 relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <motion.div
                        className="absolute left-0 top-0 bottom-0 w-1 text-xs text-white/30 overflow-hidden"
                        style={{ fontFamily: 'VT323, monospace' }}
                        animate={{ y: [0, -50, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    >
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i}>│</div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Center visualizer */}
                <motion.div
                    className="flex-shrink-0 flex flex-col items-center gap-8"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
                >
                    <CircularVisualizer
                        onFile={handleFile}
                        isAnalyzing={analyzing}
                        progressMessage={progressMessage}
                    />

                    {/* Model Selector Toggle */}
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-sm font-mono text-[10px] tracking-tight relative z-20">
                        <button
                            onClick={() => setSelectedModel("htdemucs_6s")}
                            className={`px-4 py-2 transition-all ${selectedModel === 'htdemucs_6s'
                                ? 'bg-cyan-500 text-black font-bold'
                                : 'text-gray-500 hover:text-white'}`}
                        >
                            [GRANULAR_6S]
                        </button>
                        <button
                            onClick={() => setSelectedModel("htdemucs_ft")}
                            className={`px-4 py-2 transition-all ${selectedModel === 'htdemucs_ft'
                                ? 'bg-yellow-500 text-black font-bold'
                                : 'text-gray-500 hover:text-white'}`}
                        >
                            [HI_FIDELITY_FT]
                        </button>
                    </div>
                </motion.div>

                {/* Right panel */}
                <motion.div
                    className="w-80 space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <StatsPanel tracks={tracks} />
                    <RecentScans tracks={tracks} />
                </motion.div>
            </motion.div>

            {/* Bottom navigation */}
            <BottomNav />
        </div>
    );
}
