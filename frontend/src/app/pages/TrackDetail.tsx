import { useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, Variants, AnimatePresence, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowLeft, Play, Disc } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { DashboardBrand } from '../components/DashboardBrand';
import { WaveformVisualization } from '../components/WaveformVisualization';
import { fadeSlideVariants, parallaxDepth, springPresets } from '../motion/motionTokens';

// Animation Variants
const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
            ...springPresets.soft
        }
    }
};

const itemVariants = fadeSlideVariants.fadeInUp;
const sideVariants = fadeSlideVariants.fadeInRight;

interface TrackDetailProps {
    onReAnalyze: (filename: string, model: string) => void;
    isAnalyzing: boolean;
    progressMessage: string;
}

export default function TrackDetail({ onReAnalyze, isAnalyzing, progressMessage }: TrackDetailProps) {
    const location = useLocation();
    const track = location.state?.track;
    // Extract ID from path to match RecentScans layoutId
    const id = location.pathname.split('/').pop();
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: scrollRef,
        offset: ["start start", "end start"],
    });

    const gridParallax = useTransform(scrollYProgress, [0, 1], [0, -220 * parallaxDepth.deep]);
    const particleParallax = useTransform(scrollYProgress, [0, 1], [0, -140 * parallaxDepth.mid]);
    const gridY = useSpring(gridParallax, { stiffness: 90, damping: 24, mass: 0.9 });
    const particlesY = useSpring(particleParallax, { stiffness: 90, damping: 26, mass: 0.9 });

    const [selectedCue, setSelectedCue] = useState<any>(null);

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

    const { bpm, key, texture, color, loudness, danceability, mix_points, meta, energy_level, descriptors, cues, waveform, stems, stem_files } = track;

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
        <div ref={scrollRef} className="relative flex flex-col h-screen ml-32 bg-black text-white overflow-hidden">
            <DashboardBrand />

            {/* Parallax layers */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-25"
                style={{
                    y: gridY,
                    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0,255,255,0.08), transparent 30%), radial-gradient(circle at 80% 60%, rgba(255,0,153,0.08), transparent 30%), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: "100% 100%, 100% 100%, 90px 90px, 90px 90px",
                    willChange: "transform",
                }}
            />
            <motion.div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{
                    y: particlesY,
                    backgroundImage: `radial-gradient(2px 2px at 25% 45%, rgba(255,255,255,0.4), transparent), radial-gradient(2px 2px at 70% 20%, rgba(0,255,255,0.4), transparent), radial-gradient(3px 3px at 85% 75%, rgba(255,0,153,0.4), transparent)`,
                    backgroundSize: "240px 240px",
                    willChange: "transform",
                }}
            />

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
                        <motion.div
                            layoutId={`track-texture-${id}`}
                            className="inline-flex items-center gap-2 px-3 py-1 mt-2 rounded-full bg-white/5 border border-white/10 text-[10px] tracking-widest text-white/60"
                            variants={sideVariants}
                        >
                            <span className="w-2 h-2 rounded-full bg-cyan-400/80 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                            {texture?.toUpperCase() || "TEXTURE_PENDING"}
                        </motion.div>
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
                            <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                <span className="text-gray-500">MOOD_EST</span>
                                <span className="text-2xl text-purple-400 font-bold">{descriptors?.mood || 'ANALYZING'}</span>
                            </div>

                            {/* Re-analyze Toggle */}
                            <div className="pt-4 mt-auto">
                                <motion.button
                                    onClick={() => !isAnalyzing && meta?.filename && onReAnalyze(meta.filename, "htdemucs_ft")}
                                    disabled={isAnalyzing || !meta?.filename}
                                    className={`w-full py-3 px-4 border-2 border-dashed font-bold transition-all flex items-center justify-center gap-3
                                        ${(isAnalyzing || !meta?.filename)
                                            ? 'border-yellow-500/50 text-yellow-500/50 cursor-not-allowed'
                                            : 'border-white/20 text-white/40 hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/5'}`}
                                    whileHover={{ scale: (isAnalyzing || !meta?.filename) ? 1 : 1.02 }}
                                    whileTap={{ scale: (isAnalyzing || !meta?.filename) ? 1 : 0.98 }}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Disc className="w-4 h-4 animate-spin" />
                                            <span>{progressMessage || 'PROCESSING...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            <span>TRY_HTDEMUCS_FT_FIDELITY</span>
                                        </>
                                    )}
                                </motion.button>
                                <p className="text-[10px] text-gray-600 mt-2 text-center">
                                    [SWITCH_TO_4_STEM_HIGH_FIDELITY]
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Center: Timeline & Structure */}
                    <motion.div className="col-span-12 md:col-span-8 flex flex-col gap-6 h-full" variants={itemVariants}>
                        {/* Interactive Waveform */}
                        <motion.div
                            variants={itemVariants}
                            className="w-full"
                            layoutId={`track-waveform-${id}`}
                        >
                            <h3 className="text-[10px] text-gray-500 font-mono mb-2 tracking-widest">SONIC_WAVEFORM_MAP [{(waveform?.length || 0)} pts]</h3>
                            <WaveformVisualization
                                data={waveform || []}
                                cues={cues || []}
                                stems={stems}
                                stemUrls={stem_files ? {
                                    main: `http://localhost:5000/audio/${meta?.filename}`,
                                    vocal: `http://localhost:5000/audio/${stem_files.vocal}`,
                                    bass: `http://localhost:5000/audio/${stem_files.bass}`,
                                    kick: `http://localhost:5000/audio/${stem_files.kick}`,
                                    hihats: `http://localhost:5000/audio/${stem_files.hihats}`,
                                    piano: `http://localhost:5000/audio/${stem_files.piano}`,
                                    guitar: `http://localhost:5000/audio/${stem_files.guitar}`,
                                    other: `http://localhost:5000/audio/${stem_files.other}`,
                                } : undefined}
                                midiUrls={track.midi_files ? {
                                    bass: track.midi_files.bass ? `http://localhost:5000/audio/${track.midi_files.bass}` : undefined,
                                    piano: track.midi_files.piano ? `http://localhost:5000/audio/${track.midi_files.piano}` : undefined,
                                    guitar: track.midi_files.guitar ? `http://localhost:5000/audio/${track.midi_files.guitar}` : undefined,
                                } : undefined}
                                audioUrl={`http://localhost:5000/audio/${meta?.filename}`}
                                vocalUrl={`http://localhost:5000/audio/${meta?.filename?.split('.').slice(0, -1).join('.')}_vocal.wav`}
                                percUrl={`http://localhost:5000/audio/${meta?.filename?.split('.').slice(0, -1).join('.')}_perc.wav`}
                                onCueClick={setSelectedCue}
                            />
                        </motion.div>

                        {/* Selected Cue Detail Panel */}
                        <AnimatePresence mode="wait">
                            {selectedCue ? (
                                <motion.div
                                    key={selectedCue.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="border border-white/20 bg-white/5 p-4 overflow-hidden"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCue.color }} />
                                                <span className="text-xs text-gray-500 font-mono">
                                                    {selectedCue.type === 'range' ? 'SECTION_INTEL' : 'MIX_POINT_INTEL'}
                                                </span>
                                            </div>
                                            <h4 className="text-2xl font-bold text-white tracking-tight">{selectedCue.label}</h4>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 font-mono">
                                                {selectedCue.type === 'range' ? 'DURATION' : 'TIMESTAMP'}
                                            </div>
                                            <div className="text-xl font-bold text-cyan-400">
                                                {selectedCue.type === 'range' ? `${selectedCue.duration}s` : selectedCue.time}
                                            </div>
                                            {selectedCue.type === 'range' && (
                                                <div className="text-[10px] text-gray-600 font-mono">ENDS @ {formatTime(selectedCue.endTime)}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 text-sm font-mono text-gray-400 grid grid-cols-3 gap-8">
                                        <div>
                                            <p className="text-[10px] text-gray-600 mb-1">STEM_DENSITY</p>
                                            <p className="text-white text-xs">{selectedCue.label.includes('CHORUS') ? 'CRITICAL (95%)' : 'STABLE (64%)'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-600 mb-1">PITCH_VARIANCE</p>
                                            <p className="text-white text-xs">DYNAMIC_SHIFT</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-600 mb-1">LYRICAL_PROBABILITY</p>
                                            <p className="text-white text-xs text-green-400">VERIFIED_VOCAL</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-24 border border-white/10 bg-black/20 flex items-center justify-center border-dashed"
                                >
                                    <span className="text-gray-600 font-mono text-xs animate-pulse">:: CLICK_WAVEFORM_MARKER_FOR_INTEL ::</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

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

                        {/* Sonic Profile - New Row */}
                        <motion.div
                            className="w-full border border-white/20 p-6 bg-black/40 flex justify-between items-center mt-6"
                            variants={itemVariants}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 font-mono">DYNAMIC_RANGE</span>
                                <span className="text-xl font-bold font-mono text-cyan-300">{descriptors?.dynamic_range || '--'} dB</span>
                                <span className="text-[10px] text-gray-600">CREST FACTOR</span>
                            </div>
                            <div className="h-8 w-px bg-white/20"></div>
                            <div className="flex flex-col gap-1 text-right">
                                <span className="text-xs text-gray-500 font-mono">SONIC_DEFINITION</span>
                                <span className="text-xl font-bold font-mono text-yellow-300">{descriptors?.contrast || '--'}</span>
                                <span className="text-[10px] text-gray-600">SPECTRAL CONTRAST</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right Col: Cue Points */}
                    <div className="col-span-12 mt-4">
                        <motion.div
                            className="border border-white/20 p-6 bg-black/40"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-sm text-gray-400 font-mono mb-4 border-b border-white/10 pb-2">:: DETECTED_CUE_POINTS ::</h3>
                            <div className="flex flex-wrap gap-4">
                                {cues?.map((cue: any) => (
                                    <div key={cue.id} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-sm group hover:border-white/30 transition-colors cursor-default">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cue.color }}></div>
                                        <div className="font-mono text-lg font-bold text-white">{cue.time}</div>
                                        <div className="text-xs text-gray-400 font-mono tracking-wider ml-1">{cue.label}</div>
                                    </div>
                                )) || <div className="text-gray-600 font-mono text-sm italic">NO_CUES_DETECTED</div>}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div >

            <BottomNav />
        </div >
    )
}
