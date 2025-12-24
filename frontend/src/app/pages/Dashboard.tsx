import { BottomNav } from '../components/BottomNav';
import { CircularVisualizer } from '../components/CircularVisualizer';
import { DashboardBrand } from '../components/DashboardBrand';
import { motion } from 'motion/react';
import { GlassPanel } from '../components/ui/GlassPanel';
import { GlassChip } from '../components/ui/GlassChip';
import { RecentScans } from '../components/RecentScans';
import { StatsPanel } from '../components/StatsPanel';
import { SystemStats } from '../components/SystemStats';

interface DashboardProps {
    tracks: any[];
    handleFile: (file: File) => void;
    analyzing: boolean;
    progressMessage: string;
    selectedModel: "htdemucs_6s" | "htdemucs_ft";
    setSelectedModel: (m: "htdemucs_6s" | "htdemucs_ft") => void;
}

export default function Dashboard({ tracks, handleFile, analyzing, progressMessage, selectedModel, setSelectedModel }: DashboardProps) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-black text-white">
            {/* Parallax background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="relative h-full w-full [perspective:1600px]">
                    <motion.div
                        className="absolute inset-[-30%] bg-[radial-gradient(circle_at_20%_30%,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(234,179,8,0.12),transparent_32%),radial-gradient(circle_at_60%_70%,rgba(59,130,246,0.12),transparent_32%)]"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{ x: [-30, 20, -20], y: [10, -20, 10], rotateZ: [0, 2, -2] }}
                        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute inset-0 opacity-40"
                        style={{ transform: 'translateZ(-200px)' }}
                        animate={{ backgroundPosition: ['0% 0%', '100% 50%', '0% 0%'] }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    >
                        <div className="h-full w-full bg-[radial-gradient(circle,_rgba(255,255,255,0.04)_1px,_transparent_1px)] bg-[size:80px_80px]" />
                    </motion.div>
                </div>
            </div>

            <div className="relative z-10 ml-32 flex flex-col min-h-screen">
                <DashboardBrand />

                {/* Model Selector Toggle */}
                <GlassPanel
                    elevation="raised"
                    tint="cyan"
                    className="relative z-20 flex items-center gap-2 rounded-2xl p-1 font-mono text-[10px] tracking-tight"
                >
                    <GlassChip
                        tone="cyan"
                        active={selectedModel === "htdemucs_6s"}
                        onClick={() => setSelectedModel("htdemucs_6s")}
                        className="flex-1 justify-center"
                    >
                        [GRANULAR_6S]
                    </GlassChip>
                    <GlassChip
                        tone="amber"
                        active={selectedModel === "htdemucs_ft"}
                        onClick={() => setSelectedModel("htdemucs_ft")}
                        className="flex-1 justify-center"
                    >
                        [HI_FIDELITY_FT]
                    </GlassChip>
                </GlassPanel>
                {/* Top system stats ribbon */}
                <GlassPanel className="mx-8 mt-6 border-white/20 bg-white/5" elevation="raised">
                    <SystemStats />
                </GlassPanel>

                {/* Main bento grid */}
                <motion.div
                    className="grid flex-1 grid-cols-12 gap-6 px-8 py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                >
                    {/* Hero analyzer */}
                    <motion.div
                        className="relative col-span-12 md:col-span-7 xl:col-span-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 60 }}
                    >
                        <GlassPanel className="h-full min-h-0 p-6" elevation="overlay">
                            <div className="relative flex h-full min-h-0 flex-col items-center justify-center">
                                <CircularVisualizer
                                    onFile={handleFile}
                                    isAnalyzing={analyzing}
                                    progressMessage={progressMessage}
                                />

                                <GlassChip className="absolute right-6 top-6 z-30 bg-white/20" aria-label="Model selector">
                                    <button
                                        onClick={() => setSelectedModel('htdemucs_6s')}
                                        className={`rounded-full px-3 py-1 transition-colors ${selectedModel === 'htdemucs_6s' ? 'bg-cyan-300 text-black shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'text-white/70 hover:text-white'}`}
                                    >
                                        [GRANULAR_6S]
                                    </button>
                                    <span className="text-white/20">/</span>
                                    <button
                                        onClick={() => setSelectedModel('htdemucs_ft')}
                                        className={`rounded-full px-3 py-1 transition-colors ${selectedModel === 'htdemucs_ft' ? 'bg-amber-300 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]' : 'text-white/70 hover:text-white'}`}
                                    >
                                        [HI_FIDELITY_FT]
                                    </button>
                                </GlassChip>
                            </div>
                        </GlassPanel>
                    </motion.div>

                    {/* Stats ribbon & recent rail */}
                    <motion.div
                        className="col-span-12 md:col-span-5 xl:col-span-4 flex flex-col gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 60 }}
                    >
                        <GlassPanel className="p-4" elevation="raised">
                            <StatsPanel tracks={tracks} />
                        </GlassPanel>

                        <GlassPanel className="p-4" elevation="base">
                            <RecentScans tracks={tracks} />
                        </GlassPanel>
                    </motion.div>
                </motion.div>

                {/* Bottom navigation */}
                <BottomNav />
            </div>
        </div>
    );
}
