import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, Music, Mic2, Zap, Triangle, Layers, Disc, FileMusic } from 'lucide-react';

interface Cue {
    id: string;
    label: string;
    time: string;
    color: string;
    type?: 'point' | 'range';
    startTime?: number;
    endTime?: number;
    duration?: number;
}

interface WaveformProps {
    data: number[];
    cues: Cue[];
    // Updated props for 5-stem system
    stemUrls?: {
        main?: string;
        vocal?: string;
        bass?: string;
        kick?: string;
        hihats?: string;
        piano?: string;
        guitar?: string;
        other?: string;
    };
    stems?: {
        vocal?: number[];
        bass?: number[];
        kick?: number[];
        hihats?: number[];
        piano?: number[];
        guitar?: number[];
        other?: number[];
    };
    // Legacy support (optional)
    audioUrl?: string;
    vocalUrl?: string;
    percUrl?: string;
    midiUrls?: {
        bass?: string;
        piano?: string;
        guitar?: string;
    };

    onCueClick?: (cue: Cue) => void;
    layoutId?: string;
}

export const WaveformVisualization = ({ data, cues, stems, stemUrls, midiUrls, audioUrl, vocalUrl, percUrl, onCueClick, layoutId }: WaveformProps) => {
    const [hoveredCue, setHoveredCue] = useState<Cue | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(1);

    // 5-Stem System State
    // main: Original Mix. If true, stems are MUTED.
    // If main is false, stems are audible based on their toggle.
    const [mainActive, setMainActive] = useState(true);
    const [activeStems, setActiveStems] = useState({
        vocal: false,
        bass: false,
        kick: false,
        hihats: false,
        piano: false,
        guitar: false,
        other: false
    });

    const [audioError, setAudioError] = useState<string | null>(null);

    // Audio Refs
    const refs = {
        main: useRef<HTMLAudioElement>(null),
        vocal: useRef<HTMLAudioElement>(null),
        bass: useRef<HTMLAudioElement>(null),
        kick: useRef<HTMLAudioElement>(null),
        hihats: useRef<HTMLAudioElement>(null),
        piano: useRef<HTMLAudioElement>(null),
        guitar: useRef<HTMLAudioElement>(null),
        other: useRef<HTMLAudioElement>(null),
    };

    // Legacy mapping if stemUrls not provided
    const urls = stemUrls || {
        main: audioUrl,
        vocal: vocalUrl,
        bass: "", // fallback
        kick: percUrl, // map perc to kick for legacy
        hihats: "",
        piano: "",
        guitar: "",
        other: ""
    };

    if (!data || data.length === 0) return null;

    // Sync Helper
    const syncStems = (time: number) => {
        Object.values(refs).forEach(ref => {
            if (ref.current && Math.abs(ref.current.currentTime - time) > 0.1) {
                ref.current.currentTime = time;
            }
        });
    };

    // Playback Logic
    useEffect(() => {
        // Manage Volume/Mute based on state
        // If Main is Active: Main = 100%, Stems = 0%
        // If Main is Inactive: Main = 0%, Stems = 100% if active, 0% if inactive

        if (refs.main.current) refs.main.current.volume = mainActive ? 1.0 : 0.0;

        if (refs.vocal.current) refs.vocal.current.volume = (!mainActive && activeStems.vocal) ? 1.0 : 0.0;
        if (refs.bass.current) refs.bass.current.volume = (!mainActive && activeStems.bass) ? 1.0 : 0.0;
        if (refs.kick.current) refs.kick.current.volume = (!mainActive && activeStems.kick) ? 1.0 : 0.0;
        if (refs.hihats.current) refs.hihats.current.volume = (!mainActive && activeStems.hihats) ? 1.0 : 0.0;
        if (refs.piano.current) refs.piano.current.volume = (!mainActive && activeStems.piano) ? 1.0 : 0.0;
        if (refs.guitar.current) refs.guitar.current.volume = (!mainActive && activeStems.guitar) ? 1.0 : 0.0;
        if (refs.other.current) refs.other.current.volume = (!mainActive && activeStems.other) ? 1.0 : 0.0;

        // Play/Pause State
        Object.values(refs).forEach(ref => {
            if (ref.current) {
                if (isPlaying) {
                    // Only play if not already playing to avoid promise errors
                    if (ref.current.paused) ref.current.play().catch(e => console.log("Play error", e));
                } else {
                    ref.current.pause();
                }
            }
        });

    }, [isPlaying, mainActive, activeStems]);

    const handlePlayPause = () => {
        if (!isPlaying) syncStems(refs.main.current?.currentTime || 0);
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.MouseEvent) => {
        if (!waveformRef.current) return;
        const rect = waveformRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        const newTime = percent * duration;

        if (refs.main.current) refs.main.current.currentTime = newTime;
        syncStems(newTime);
        setCurrentTime(newTime);
    };

    const toggleMain = () => {
        // If clicking Main, exclusive switch to Main
        setMainActive(true);
        // Reset stems to all ON for convenience when switching back? Or keep state?
        // Let's keep state but visually they will be inactive until Main is disabled
        // Actually best UX: Main ON -> Stems look disabled.
    };

    const toggleStem = (stem: keyof typeof activeStems) => {
        // If currently in Main mode, switch to Stem mode and Solo this stem
        if (mainActive) {
            setMainActive(false);
            setActiveStems({
                vocal: false,
                bass: false,
                kick: false,
                hihats: false,
                piano: false,
                guitar: false,
                other: false,
                [stem]: true
            });
        } else {
            // Toggle stem normally
            setActiveStems(prev => ({ ...prev, [stem]: !prev[stem] }));
        }
    };

    // Stems Config for UI Loop
    const STEM_CONFIG = [
        { id: 'vocal', label: 'VOCALS', icon: Mic2, color: 'text-purple-400', bg: 'bg-purple-500' },
        { id: 'piano', label: 'PIANO', icon: Music, color: 'text-pink-400', bg: 'bg-pink-500' },
        { id: 'guitar', label: 'GUITAR', icon: Zap, color: 'text-orange-400', bg: 'bg-orange-500' },
        { id: 'bass', label: 'BASS', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500' },
        { id: 'kick', label: 'KICK', icon: Disc, color: 'text-red-400', bg: 'bg-red-500' },
        { id: 'hihats', label: 'HATS', icon: Triangle, color: 'text-cyan-400', bg: 'bg-cyan-500' },
        { id: 'other', label: 'SYNTH', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500' }, // "Other" mapped to Synth/FX
    ] as const;

    const waveformRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) handleSeek(e);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        handleSeek(e);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <div className="flex flex-col gap-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            {/* Audio Elements */}
            <audio ref={refs.main} src={urls.main} crossOrigin="anonymous" onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} onDurationChange={(e) => setDuration(e.currentTarget.duration)} onEnded={() => setIsPlaying(false)} onError={() => setAudioError("MAIN_AUDIO_FAIL")} />
            <audio ref={refs.vocal} src={urls.vocal} crossOrigin="anonymous" loop />
            <audio ref={refs.bass} src={urls.bass} crossOrigin="anonymous" loop />
            <audio ref={refs.kick} src={urls.kick} crossOrigin="anonymous" loop />
            <audio ref={refs.hihats} src={urls.hihats} crossOrigin="anonymous" loop />
            <audio ref={refs.piano} src={urls.piano} crossOrigin="anonymous" loop />
            <audio ref={refs.guitar} src={urls.guitar} crossOrigin="anonymous" loop />
            <audio ref={refs.other} src={urls.other} crossOrigin="anonymous" loop />

            {/* Waveform Container */}
            <div
                ref={waveformRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                className="relative w-full h-40 bg-black/60 border border-white/10 rounded-sm overflow-hidden group cursor-crosshair shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
            >
                {/* Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Stems Visualization (Visuals only active if stem is playing?) */}
                {/* To show density, we can always show them faintly */}
                <div className="absolute inset-0 flex items-center justify-between px-1 gap-[1px] opacity-30 pointer-events-none">
                    {/* Render separate layers for each stem if data exists */}
                    {!mainActive && activeStems.vocal && stems?.vocal && stems.vocal.map((val, i) => (
                        <div key={`v-${i}`} className="bg-purple-500 absolute bottom-0 w-[4px]" style={{ left: `${(i / stems.vocal!.length) * 100}%`, height: `${val * 60}%`, opacity: 0.5 }} />
                    ))}
                    {!mainActive && activeStems.kick && stems?.kick && stems.kick.map((val, i) => (
                        <div key={`k-${i}`} className="bg-red-500 absolute bottom-0 w-[4px]" style={{ left: `${(i / stems.kick!.length) * 100}%`, height: `${val * 50}%`, opacity: 0.5 }} />
                    ))}
                    {/* Can add others but might get messy. Maybe just Kick and Vocal for visual reference */}
                </div>

                {/* Main Waveform */}
                <div className="absolute inset-0 flex items-center justify-between px-1 gap-[2px]">
                    {data.map((val, i) => {
                        const isPast = (i / data.length) < (currentTime / duration);
                        return (
                            <motion.div
                                key={i}
                                className={`w-full rounded-sm transition-colors duration-200 ${isPast ? 'bg-cyan-400' : 'bg-white/20'}`}
                                style={{ height: `${Math.max(4, val * 100)}%`, boxShadow: isPast ? '0 0 10px rgba(34,211,238,0.3)' : 'none' }}
                            />
                        );
                    })}
                </div>

                {/* Cue Markers */}
                {cues.filter((cue) => typeof cue.startTime === 'number' && Number.isFinite(cue.startTime)).map((cue) => {
                    const percent = (cue.startTime! / duration) * 100;
                    return (
                        <div
                            key={cue.id}
                            className="absolute h-full top-0 cursor-pointer group/cue"
                            style={{ left: `${percent}%`, width: '16px', zIndex: 30, transform: 'translateX(-50%)' }}
                            onClick={(e) => { e.stopPropagation(); onCueClick?.(cue); }}
                            onMouseEnter={() => setHoveredCue(cue)}
                            onMouseLeave={() => setHoveredCue(null)}
                        >
                            <div className="h-full w-[1px] bg-white/20 group-hover/cue:bg-white/60 transition-colors mx-auto" />
                            <motion.div
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border border-white/40 shadow-lg"
                                style={{ backgroundColor: cue.color }}
                                whileHover={{ scale: 1.2, rotate: 135 }}
                            />
                        </div>
                    );
                })}

                {/* Playhead */}
                <div
                    className="absolute h-full top-0 w-[2px] bg-yellow-400 z-40 pointer-events-none"
                    style={{ left: `${(currentTime / duration) * 100}%`, boxShadow: '0 0 15px #facc15' }}
                >
                    <div className="absolute top-[-4px] left-[-4px] w-[10px] h-[10px] bg-yellow-400 rounded-full" />
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-white/5 border border-white/10 p-4 rounded-sm font-mono gap-4">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handlePlayPause}
                        className="w-12 h-12 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0"
                    >
                        {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                    </button>

                    <div className="flex flex-col shrink-0">
                        <span className="text-[10px] text-gray-500 tracking-[0.2em] uppercase">
                            {audioError ? 'SYSTEM_CRITICAL_ERROR' : 'TIME_ELAPSED'}
                        </span>
                        <div className="text-xl font-bold flex gap-2 items-baseline whitespace-nowrap">
                            {audioError ? (
                                <span className="text-red-500 animate-pulse">{audioError}</span>
                            ) : (
                                <>
                                    <span className="text-white">
                                        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                                    </span>
                                    <span className="text-gray-600 text-xs">/ {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stems Mixer */}
                <div className="flex flex-wrap items-center gap-2 justify-center xl:justify-end">
                    {/* Master Channel */}
                    <button
                        onClick={toggleMain}
                        className={`flex items-center gap-2 px-4 py-2 rounded-sm border transition-all ${mainActive
                            ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                            : 'bg-black/40 border-white/10 text-gray-600'
                            }`}
                    >
                        <Music size={14} />
                        <span className="text-[10px] font-bold">MASTER</span>
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-2 hidden xl:block" />

                    {/* Stem Channels */}
                    {STEM_CONFIG.map(({ id, icon: Icon, label, color, bg }) => {
                        // Skip if stem URL is missing (e.g. Piano/Guitar in 4-stem model)
                        if (!urls[id as keyof typeof urls]) return null;

                        const isActive = !mainActive && activeStems[id as keyof typeof activeStems];
                        return (
                            <button
                                key={id}
                                onClick={() => toggleStem(id as any)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-sm border transition-all ${isActive
                                    ? `${bg}/20 border-${bg.split('-')[1]}-500 ${color}`
                                    : 'bg-black/40 border-white/10 text-gray-600 grayscale'
                                    }`}
                            >
                                <Icon size={14} />
                                <span className="text-[10px] font-bold">{label}</span>

                                {midiUrls?.[id as keyof typeof midiUrls] && (
                                    <a
                                        href={midiUrls[id as keyof typeof midiUrls]}
                                        download={`${label}_TRANSCRIPTION.mid`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="ml-1 p-1 hover:bg-white/20 rounded-full transition-colors text-white/40 hover:text-white"
                                        title="Download MIDI Transcription"
                                    >
                                        <FileMusic size={12} />
                                    </a>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tooltip */}
            <AnimatePresence>
                {hoveredCue && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="fixed pointer-events-none z-[100] bg-black/95 border border-white/20 p-3 shadow-2xl backdrop-blur-xl"
                        style={{ left: '50%', transform: 'translateX(-50%)', bottom: '150px' }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: hoveredCue.color, color: hoveredCue.color }} />
                            <div>
                                <div className="text-[10px] text-gray-500">TAGGED_LOCATION</div>
                                <div className="text-white font-bold">{hoveredCue.label}</div>
                            </div>
                            <div className="bg-white/10 px-2 py-1 text-cyan-400 text-xs rounded-sm">
                                {hoveredCue.time}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
