import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { Disc, Play, Sparkles } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { DashboardBrand } from '../components/DashboardBrand';
import { GlassPanel } from '../components/ui/GlassPanel';
import { GlassChip } from '../components/ui/GlassChip';
import { TrackDetailHeader } from '../components/track-detail/TrackDetailHeader';
import { TrackWaveformBlock } from '../components/track-detail/TrackWaveformBlock';
import { TrackCueList } from '../components/track-detail/TrackCueList';
import { TrackMetricsPanels } from '../components/track-detail/TrackMetricsPanels';
import { TrackActionDock } from '../components/track-detail/TrackActionDock';
import { trackDetailMotion } from '../components/track-detail/trackDetailMotion';
import { formatTime, renderBar } from '../components/track-detail/trackDetailUtils';

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
    const stemUrls = stem_files ? {
        main: `http://localhost:5000/audio/${meta?.filename}`,
        vocal: `http://localhost:5000/audio/${stem_files.vocal}`,
        bass: `http://localhost:5000/audio/${stem_files.bass}`,
        kick: `http://localhost:5000/audio/${stem_files.kick}`,
        hihats: `http://localhost:5000/audio/${stem_files.hihats}`,
        piano: `http://localhost:5000/audio/${stem_files.piano}`,
        guitar: `http://localhost:5000/audio/${stem_files.guitar}`,
        other: `http://localhost:5000/audio/${stem_files.other}`,
    } : undefined;
    const midiUrls = track.midi_files ? {
        bass: track.midi_files.bass ? `http://localhost:5000/audio/${track.midi_files.bass}` : undefined,
        piano: track.midi_files.piano ? `http://localhost:5000/audio/${track.midi_files.piano}` : undefined,
        guitar: track.midi_files.guitar ? `http://localhost:5000/audio/${track.midi_files.guitar}` : undefined,
    } : undefined;

    useEffect(() => {
        if (autoReveal && cues?.length && !selectedCue) {
            setSelectedCue(cues[0]);
        }
    }, [autoReveal, cues, selectedCue]);

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
                variants={trackDetailMotion.page}
                initial="hidden"
                animate="show"
                layoutId={`track-container-${id}`}
            >
                <TrackDetailHeader id={id} meta={meta} />

                {/* Grid Layout - Bento Rows */}
                <div className="flex-1 grid grid-cols-12 gap-6 auto-rows-[minmax(0,1fr)] min-h-0">
                    {/* Left Col: Cover & Basic Stats */}
                    <motion.div className="col-span-12 lg:col-span-3 flex flex-col gap-4 min-h-0" variants={trackDetailMotion.panel}>
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

                        {/* Core Metrics Box - Fills remaining height in column */}
                        <motion.div layoutId={`track-stats-${id}`} className="flex-1">
                            <GlassPanel
                                elevation="overlay"
                                tint="cyan"
                                className="flex h-full flex-col justify-center space-y-6 rounded-2xl p-6 font-mono text-sm"
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
                            </GlassPanel>
                        </motion.div>

                    </motion.div>

                    {/* Center: Timeline & Structure */}
                    <div className="col-span-12 lg:col-span-6 flex flex-col gap-4 min-h-0">
                        <TrackWaveformBlock
                            waveformPoints={waveformPoints}
                            cues={cues || []}
                            stems={stems}
                            stemUrls={stemUrls}
                            midiUrls={midiUrls}
                            audioUrl={`http://localhost:5000/audio/${meta?.filename}`}
                            vocalUrl={`http://localhost:5000/audio/${meta?.filename?.split('.').slice(0, -1).join('.')}_vocal.wav`}
                            percUrl={`http://localhost:5000/audio/${meta?.filename?.split('.').slice(0, -1).join('.')}_perc.wav`}
                            selectedCue={selectedCue}
                            onCueClick={setSelectedCue}
                            formatTime={formatTime}
                            layoutId={id}
                        />

                        <TrackMetricsPanels
                            mixPoints={mix_points}
                            descriptors={descriptors}
                            danceability={danceability}
                            loudness={loudness}
                            texture={texture}
                            color={color}
                        />
                    </div>

                    {/* Right Col: Cue Points & Stems */}
                    <TrackCueList
                        cues={cues || []}
                        onSelectCue={setSelectedCue}
                        stems={stems}
                        danceability={danceability}
                        loudness={loudness}
                    />
                </div>
            </motion.div>

            <TrackActionDock
                isAnalyzing={isAnalyzing}
                meta={meta}
                progressMessage={progressMessage}
                onReAnalyze={onReAnalyze}
                autoReveal={autoReveal}
                setAutoReveal={setAutoReveal}
                showDust={showDust}
                setShowDust={setShowDust}
            />

            <BottomNav />
        </div>
    );
}
