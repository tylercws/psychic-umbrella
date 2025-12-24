import { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, Play, Disc, Sparkles, Waves, Orbit, Music, ToggleLeft, ToggleRight } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { DashboardBrand } from '../components/DashboardBrand';
import { WaveformVisualization } from '../components/WaveformVisualization';
import { motionTokens } from '../motionTokens';

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

    const [selectedCue, setSelectedCue] = useState<any>(null);
    const [autoReveal, setAutoReveal] = useState(true);
    const [showDust, setShowDust] = useState(true);

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

    const { scrollYProgress } = useScroll();
    const gridParallax = useTransform(scrollYProgress, [0, 1], [0, -120]);
    const dustParallax = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const dustOpacity = useTransform(scrollYProgress, [0, 1], [0.3, 0.7]);

    const waveformPoints = useMemo(() => waveform || [], [waveform]);

    useEffect(() => {
        if (autoReveal && cues?.length && !selectedCue) {
            setSelectedCue(cues[0]);
        }
    }, [autoReveal, cues, selectedCue]);

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
        <div className="relative flex flex-col h-screen ml-32 bg-black text-white overflow-hidden">
            <DashboardBrand />

            <motion.div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06)_0,transparent_30%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.08)_0,transparent_26%),radial-gradient(circle_at_40%_80%,rgba(236,72,153,0.08)_0,transparent_30%)]"
                    style={{ y: gridParallax, opacity: 0.5 }}
                />
                <motion.div
                    className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px]"
                    style={{ y: gridParallax, opacity: 0.12 }}
                />
                <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,255,255,0.12)_0,transparent_20%),radial-gradient(circle_at_90%_30%,rgba(34,211,238,0.14)_0,transparent_16%),radial-gradient(circle_at_60%_90%,rgba(168,85,247,0.16)_0,transparent_18%)]"
                    style={{ y: dustParallax, opacity: showDust ? dustOpacity : 0 }}
                />
            </motion.div>

            {/* Main Content - Scaled to fit viewport (min-h-0 prevents overflow loop) */}
            <motion.div
                className="flex-1 p-6 lg:p-10 flex flex-col min-h-0 overflow-y-auto relative z-10"
                variants={motionTokens.page}
                initial="hidden"
                animate="show"
                layoutId={`track-container-${id}`}
            >
                {/* Header */}
                <motion.div className="flex items-center justify-between mb-6 border-b border-white/15 pb-4 flex-shrink-0" variants={motionTokens.bento}>
                    <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span style={{ fontFamily: 'VT323, monospace' }} className="text-xl">[RETURN_DASHBOARD]</span>
                    </Link>
                    <div className="text-right">
                        <motion.h1
                            className="text-3xl lg:text-4xl text-white font-bold tracking-tight"
                            style={{ fontFamily: 'Share Tech Mono, monospace' }}
                            layoutId={`scan-title-${id}`}
                        >
                            {meta?.title || "UNKNOWN_TITLE"}
                        </motion.h1>
                        <p className="text-gray-500 font-mono text-sm">{meta?.artist || "UNKNOWN_ARTIST"}</p>
                    </div>
                </motion.div>

                {/* Grid Layout - Bento Rows */}
                <div className="flex-1 grid grid-cols-12 gap-6 auto-rows-[minmax(0,1fr)] min-h-0">
                    {/* Left Col: Cover & Basic Stats */}
                    <motion.div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0" variants={motionTokens.bento}>
                        <motion.div
                            className="relative border border-white/10 bg-white/5 rounded-2xl p-2 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                            layoutId={`scan-card-${id}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                            <motion.div
                                className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl"
                                layoutId={`scan-cover-${id}`}
                            >
                                {meta?.cover_art ? (
                                    <img
                                        src={meta.cover_art}
                                        alt="Cover"
                                        className="w-full h-full object-cover opacity-90"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-600 gap-2 h-full">
                                        <Disc className="w-16 h-16 animate-spin-slow" />
                                        <span className="text-xs font-mono animate-pulse">SEARCHING_DB...</span>
                                        <span className="text-[10px] text-red-500 font-mono mt-1">NO_ART_FOUND</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_2px,3px_100%]" />
                            </motion.div>
                            <div className="mt-3 flex items-center justify-between font-mono text-xs text-gray-400">
                                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-cyan-400" />COVER_LOCKED</span>
                                <span className="uppercase tracking-widest">{texture}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex-1 border border-white/10 p-6 rounded-2xl bg-white/5 flex flex-col gap-4 font-mono text-sm shadow-[0_10px_50px_rgba(0,0,0,0.4)] min-h-0"
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
                            <div className="flex justify-between items-end pb-2">
                                <span className="text-gray-500">MOOD_EST</span>
                                <span className="text-2xl text-purple-400 font-bold">{descriptors?.mood || 'ANALYZING'}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] text-gray-500">TEXTURE</p>
                                    <p className="text-cyan-300 text-lg font-bold">{texture?.toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500">COLOR</p>
                                    <p className="text-pink-300 text-lg font-bold">{color?.toUpperCase()}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Center: Timeline & Structure */}
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 min-h-0">
                        <motion.div
                            className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)] flex items-center justify-between gap-4"
                            variants={motionTokens.glass}
                            initial="hidden"
                            animate="show"
                            layoutId={`track-header-${id}`}
                        >
                            <div className="flex items-center gap-3">
                                <Waves className="w-5 h-5 text-cyan-300" />
                                <div className="font-mono text-xs text-gray-400">
                                    <div className="text-white text-lg font-bold">LIQUID_WAVEFORM</div>
                                    <div>{waveformPoints.length} data points</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
                                <Orbit className="w-4 h-4 text-purple-400" />
                                <span>PARALLAX_ACTIVE</span>
                            </div>
                        </motion.div>

                        <div className="flex-1 min-h-0 grid grid-rows-[minmax(0,1fr)_auto] gap-4">
                            <WaveformVisualization
                                data={waveformPoints}
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
                                layoutId={`wave-ribbon-${id}`}
                            />

                            {/* Selected Cue Detail Panel */}
                            <AnimatePresence mode="wait">
                                {selectedCue ? (
                                    <motion.div
                                        key={selectedCue.id}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border border-white/10 bg-white/5 p-4 overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="w-2 h-2 rounded-full shadow-[0_0_12px_currentColor]" style={{ backgroundColor: selectedCue.color, color: selectedCue.color }} />
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
                                        className="h-20 border border-white/10 bg-black/30 flex items-center justify-center border-dashed rounded-2xl"
                                    >
                                        <span className="text-gray-600 font-mono text-xs animate-pulse">:: CLICK_WAVEFORM_MARKER_FOR_INTEL ::</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.div
                            className="grid grid-cols-3 gap-4 rounded-2xl border border-green-500/30 bg-black/70 p-6 font-mono text-green-400 text-sm shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                            variants={motionTokens.bento}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: "-100px" }}
                        >
                            <div className="space-y-2">
                                <div className="text-gray-400 text-xs">INTRO_END</div>
                                <div className="text-3xl font-bold">{formatTime(mix_points?.intro_end) || "--:--"}</div>
                            </div>
                            <div className="space-y-2 text-red-400">
                                <div className="text-red-300 text-xs">DROP_DETECTED</div>
                                <div className="text-4xl font-bold animate-pulse">{mix_points?.drop || "--:--"}</div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-gray-400 text-xs">OUTRO_START</div>
                                <div className="text-3xl font-bold">{formatTime(mix_points?.outro_start) || "--:--"}</div>
                            </div>
                            <div className="col-span-3 text-xs opacity-80 pt-4 border-t border-green-500/20">
                                <p>{`> STRUCTURE SEQUENCING :: OK`}</p>
                                <p>{`> INTRO COMPATIBILITY :: 98%`}</p>
                                <p>{`> DROP IMPACT :: ${mix_points?.drop || 'UNKNOWN'}`}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Col: Cue Points & Stems */}
                    <motion.div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0" variants={motionTokens.bento}>
                        <div className="border border-white/10 bg-white/5 rounded-2xl p-4 flex flex-col gap-3 min-h-0 overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400 font-mono">:: DETECTED_CUE_POINTS ::</span>
                                <Sparkles className="w-4 h-4 text-amber-300" />
                            </div>
                            <div className="flex flex-col gap-2 overflow-auto pr-1 min-h-0">
                                {cues?.map((cue: any) => (
                                    <motion.button
                                        key={cue.id}
                                        onClick={() => setSelectedCue(cue)}
                                        className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-md group hover:border-white/30 transition-colors cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                                        whileHover="hover"
                                        variants={motionTokens.float}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: cue.color, color: cue.color }}></div>
                                            <div className="font-mono text-lg font-bold text-white">{cue.time}</div>
                                        </div>
                                        <div className="text-[11px] text-gray-400 font-mono tracking-wider ml-1">{cue.label}</div>
                                    </motion.button>
                                )) || <div className="text-gray-600 font-mono text-sm italic">NO_CUES_DETECTED</div>}
                            </div>
                        </div>

                        <div className="border border-white/10 bg-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.4)]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400 font-mono">STEM_CHANNELS</span>
                                <Music className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(stems ? Object.keys(stems) : ['vocal', 'bass', 'kick', 'hihats', 'piano', 'guitar', 'other']).map((stem: any) => (
                                    <div key={stem} className="flex items-center gap-2 px-2 py-2 rounded-md bg-black/40 border border-white/10 text-xs font-mono text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                                        <span className="uppercase tracking-widest">{stem}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] text-gray-500 font-mono">Toggle stems in the dock to isolate components.</div>
                        </div>

                        <div className="border border-white/10 bg-gradient-to-br from-white/5 via-white/5 to-transparent rounded-2xl p-4 flex flex-col gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400 font-mono">LOUDNESS / DANCEABILITY</span>
                                <Sparkles className="w-4 h-4 text-pink-400" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1 font-mono text-gray-400">
                                    <span>DANCEABILITY</span>
                                    <span>{danceability}%</span>
                                </div>
                                <div className="text-purple-400 font-mono text-sm tracking-wider whitespace-nowrap overflow-hidden">
                                    {renderBar(danceability || 0)}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1 font-mono text-gray-400">
                                    <span>LOUDNESS (LUFS)</span>
                                    <span>{loudness} dB</span>
                                </div>
                                <div className="text-orange-400 font-mono text-sm tracking-widest break-all whitespace-nowrap overflow-hidden">
                                    {renderBar(Math.min(100, (loudness + 30) * 3))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div >

            {/* Floating Action Dock */}
            <motion.div
                className="fixed right-10 bottom-24 z-30"
                variants={motionTokens.glass}
                initial="hidden"
                animate="show"
            >
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-4 flex flex-col gap-3 w-64">
                    <div className="flex items-center justify-between text-xs text-gray-300 font-mono">
                        <span>RE-ANALYZE</span>
                        <span className="text-[10px] text-gray-500">htdemucs_ft</span>
                    </div>
                    <motion.button
                        onClick={() => !isAnalyzing && meta?.filename && onReAnalyze(meta.filename, "htdemucs_ft")}
                        disabled={isAnalyzing || !meta?.filename}
                        className={`w-full py-3 px-4 border border-white/20 rounded-xl font-bold transition-all flex items-center justify-center gap-3
                            ${(isAnalyzing || !meta?.filename)
                                ? 'border-yellow-500/50 text-yellow-500/50 cursor-not-allowed'
                                : 'border-white/30 text-white hover:border-cyan-500 hover:text-cyan-400 hover:bg-cyan-500/5'}`}
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
                                <span>RUN STEM SPLIT</span>
                            </>
                        )}
                    </motion.button>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-400">
                        <button
                            onClick={() => setAutoReveal(!autoReveal)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/15 hover:border-white/40 transition-colors"
                        >
                            {autoReveal ? <ToggleRight className="w-4 h-4 text-cyan-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
                            <span>AUTO_REVEAL</span>
                        </button>
                        <button
                            onClick={() => setShowDust(!showDust)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/15 hover:border-white/40 transition-colors"
                        >
                            {showDust ? <ToggleRight className="w-4 h-4 text-purple-400" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
                            <span>DUST_LAYER</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            <BottomNav />
        </div >
    )
}
