import { SystemStats } from '../components/SystemStats';
import { CircularVisualizer } from '../components/CircularVisualizer';
import { StatsPanel } from '../components/StatsPanel';
import { RecentScans } from '../components/RecentScans';
import { BottomNav } from '../components/BottomNav';
import { DashboardBrand } from '../components/DashboardBrand';
import { motion } from 'motion/react';

interface DashboardProps {
    tracks: any[];
    handleFile: (file: File) => void;
    analyzing: boolean;
    progressMessage: string;
}

export default function Dashboard({ tracks, handleFile, analyzing, progressMessage }: DashboardProps) {
    return (
        <div className="relative flex flex-col h-screen ml-32">
            {/* Top system stats */}
            <SystemStats />

            {/* Main content area */}
            <motion.div
                className="flex-1 flex items-center justify-between px-8 py-8 gap-12 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
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
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 50, delay: 0.2 }}
                >
                    <CircularVisualizer
                        onFile={handleFile}
                        isAnalyzing={analyzing}
                        progressMessage={progressMessage}
                    />
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
