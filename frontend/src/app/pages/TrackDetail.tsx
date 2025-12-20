import { useLocation, Link } from 'react-router-dom';
import { motion, Variants } from 'motion/react';
import { ArrowLeft, Play, Disc } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { DashboardBrand } from '../components/DashboardBrand';

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
};

export default function TrackDetail() {
    const location = useLocation();
    const track = location.state?.track;
    // Extract ID from path to match RecentScans layoutId
    const id = location.pathname.split('/').pop();

    if (!track) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-white font-mono">
                <h1 className="text-2xl mb-4">NO_TRACK_DATA_FOUND</h1>
                <Link to="/" className="border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors">
                    [RETURN_TO_BASE]
                </Link>
            </div>
        )
    }

    const { bpm, key, texture, color, loudness, danceability, mix_points, meta, energy_level } = track;

    // Helper for time format
    const formatTime = (seconds: number) => {
        if (!seconds && seconds !== 0) return "--:--";
        if (typeof seconds === 'string') return seconds;

        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // ASCII Progress Bar
    const renderBar = (percent: number, length: number = 20) => {
        const filled = Math.round((percent / 100) * length);
        return '█'.repeat(filled) + '░'.repeat(length - filled);
    };

    return (
        <div className="relative flex flex-col h-screen ml-32 bg-black text-white">
            <DashboardBrand />

            {/* Main Content - Scaled to fit viewport (min-h-0 prevents overflow loop) */}
            <motion.div
                className="flex-1 p-6 lg:p-10 flex flex-col min-h-0 overflow-y-auto"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                layoutId={`track-container-${id}`}
            >
                {/* Header */}
                <motion.div className="flex items-center justify-between mb-6 border-b-2 border-dashed border-white/20 pb-4 flex-shrink-0" variants={itemVariants}>
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span style={{ fontFamily: 'VT323, monospace' }} className="text-xl">[RETURN_DASHBOARD]</span>
                    </Link>
                    <div className="text-right">
                        <motion.h1
                            className="text-3xl lg:text-4xl text-white font-bold tracking-tight"
                            style={{ fontFamily: 'Share Tech Mono, monospace' }}
                            layoutId={`track-title-${id}`}
                        >
                            {meta?.title || "UNKNOWN_TITLE"}
                        </motion.h1>
                        <p className="text-gray-500 font-mono text-sm">{meta?.artist || "UNKNOWN_ARTIST"}</p>
                    </div>
                </motion.div>

                {/* Grid Layout - Grows to fill available space */}
                <div className="flex-1 grid grid-cols-12 gap-8">
                    {/* Left Col: Cover & Basic Stats */}
                    <motion.div className="col-span-12 md:col-span-4 flex flex-col gap-6 h-full" variants={itemVariants}>
                        {/* Cover Art Frame - Responsive Aspect Ratio */}
                        <div className="relative border-4 border-double border-white/40 p-2 bg-black/50 shrink-0">
                            {/* Animated Corners */}
                            <motion.div className="absolute top-0 left-0 text-white" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>╔</motion.div>
                            <motion.div className="absolute top-0 right-0 text-white" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>╗</motion.div>
                            <motion.div className="absolute bottom-0 left-0 text-white" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>╚</motion.div>
                            <motion.div className="absolute bottom-0 right-0 text-white" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}>╝</motion.div>

                            <div className="aspect-square bg-gray-900 flex items-center justify-center overflow-hidden relative group">
                                {meta?.cover_art ? (
                                    <>
                                        <img
                                            src={meta.cover_art}
                                            alt="Cover"
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                            loading="lazy"
                                        />
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-600 gap-2">
                                        <Disc className="w-16 h-16 animate-spin-slow" />
                                        <span className="text-xs font-mono animate-pulse">SEARCHING_DB...</span>
                                        <span className="text-[10px] text-red-500 font-mono mt-1">NO_ART_FOUND</span>
                                    </div>
                                )}
                                {/* Scanline overlay */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
                            </div>
                        </div>

                        {/* Core Metrics Box - Fills remaining height in column */}
                        <motion.div
                            className="flex-1 border border-white/20 p-6 flex flex-col justify-center space-y-6 font-mono text-sm bg-white/5"
                            layoutId={`track-stats-${id}`}
                        >
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <span className="text-gray-500">BPM_DETECTED</span>
                                <span className="text-4xl text-white font-bold">{bpm}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <span className="text-gray-500">KEY_SIG</span>
                                <span className="text-4xl text-cyan-400 font-bold">{key}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <span className="text-gray-500">ENERGY_LVL</span>
                                <span className={`text-2xl font-bold ${energy_level === 'High' ? 'text-red-400' : 'text-blue-400'}`}>
                                    [{energy_level?.toUpperCase() || 'MID'}]
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Center: Timeline & Structure */}
                    <motion.div className="col-span-12 md:col-span-8 flex flex-col gap-6 h-full" variants={itemVariants}>
                        {/* Mix Points Terminal - Larger/Primary Feature */}
                        <motion.div
                            className="flex-[2] bg-black/80 border border-green-500/30 p-8 font-mono text-green-400 text-sm shadow-[0_0_20px_rgba(0,255,0,0.1)] relative overflow-hidden flex flex-col justify-center"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 animate-scan"></div>

                            <h3 className="text-white border-b border-green-500/30 pb-2 mb-8 flex justify-between text-lg">
                                <span>:: MIX_STRUCTURE_ANALYSIS ::</span>
                                <span className="animate-pulse">ONLINE</span>
                            </h3>

                            <div className="grid grid-cols-3 gap-6 text-center">
                                <motion.div
                                    className="border border-green-500/20 p-6 hover:bg-green-500/5 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="text-gray-500 text-sm mb-2">INTRO_END</div>
                                    <div className="text-3xl font-bold">{formatTime(mix_points?.intro_end) || "--:--"}</div>
                                </motion.div>
                                <motion.div
                                    className="border border-red-500/40 p-6 hover:bg-red-500/5 transition-colors text-red-400"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="text-red-500/70 text-sm mb-2">DROP_DETECTED</div>
                                    <div className="text-4xl font-bold animate-pulse">{mix_points?.drop || "--:--"}</div>
                                </motion.div>
                                <motion.div
                                    className="border border-green-500/20 p-6 hover:bg-green-500/5 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className="text-gray-500 text-sm mb-2">OUTRO_START</div>
                                    <div className="text-3xl font-bold">{formatTime(mix_points?.outro_start) || "--:--"}</div>
                                </motion.div>
                            </div>

                            <div className="mt-8 space-y-2 text-sm opacity-80 font-mono">
                                <p>{`> ANALYZING STRUCTURE SEQUENCING... OK`}</p>
                                <p>{`> INTRO LENGTH COMPATIBILITY... 98%`}</p>
                                <p>{`> DROP IMPACT FACTOR... DETECTED AT ${mix_points?.drop || 'UNKNOWN'}`}</p>
                            </div>
                        </motion.div>

                        {/* Analysis Gauges - Fills remaining space */}
                        <div className="flex-1 grid grid-cols-2 gap-6">
                            {/* Loudness / Danceability */}
                            <motion.div
                                className="border border-white/20 p-6 bg-black/40 flex flex-col justify-center gap-6"
                                variants={itemVariants}
                                initial={{ x: -20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div>
                                    <div className="flex justify-between text-sm mb-2 font-mono text-gray-400">
                                        <span>DANCEABILITY</span>
                                        <span>{danceability}%</span>
                                    </div>
                                    <div className="text-purple-400 font-mono text-sm tracking-wider whitespace-nowrap overflow-hidden">
                                        {renderBar(danceability || 0)}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-2 font-mono text-gray-400">
                                        <span>LOUDNESS (LUFS)</span>
                                        <span>{loudness} dB</span>
                                    </div>
                                    <div className="text-orange-400 font-mono text-sm tracking-widest break-all whitespace-nowrap overflow-hidden">
                                        {renderBar(Math.min(100, (loudness + 30) * 3))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Texture / Color */}
                            <motion.div
                                className="border border-white/20 p-6 bg-black/40 flex flex-col justify-center space-y-6"
                                variants={itemVariants}
                                initial={{ x: 20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 text-xs text-gray-500 font-mono">TEXTURE</div>
                                    <div className="flex-1 bg-gray-900 border border-white/10 p-3 text-center text-cyan-300 font-bold font-mono text-lg">
                                        {texture?.toUpperCase()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 text-xs text-gray-500 font-mono">COLOR</div>
                                    <div className="flex-1 bg-gray-900 border border-white/10 p-3 text-center text-pink-300 font-bold font-mono text-lg">
                                        {color?.toUpperCase()}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <BottomNav />
        </div>
    )
}
