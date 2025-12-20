import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Music, Activity, Disc, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const TrackDetail = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const track = location.state?.track
    const waveformRef = useRef(null)
    const [wavesurfer, setWavesurfer] = useState(null)

    useEffect(() => {
        if (!track) {
            navigate('/')
            return
        }
    }, [track, navigate])

    // Initialize waveform (placeholder for now since we don't have audio file)
    useEffect(() => {
        if (waveformRef.current && !wavesurfer) {
            // We'll add WaveSurfer initialization here when we have audio files
            // For now, we'll show a placeholder waveform visualization
        }
    }, [wavesurfer])

    if (!track) return null

    return (
        <div className="min-h-screen w-full relative bg-[#050511] overflow-hidden">
            {/* Background Blobs */}
            <div className="blob-cont">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 p-6 md:p-10">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition-colors mb-8 group"
                    whileHover={{ x: -5 }}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Dashboard</span>
                </motion.button>

                {/* Track Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel p-8 rounded-3xl mb-8"
                >
                    <div className="flex items-start gap-6">
                        {/* Album Art Placeholder */}
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.05 }}
                            className="w-32 h-32 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 flex items-center justify-center border border-white/10 shadow-lg"
                        >
                            <Disc className="w-16 h-16 text-cyan-400 opacity-50" />
                        </motion.div>

                        {/* Track Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight glow-text">
                                {track.title}
                            </h1>
                            <p className="text-xl text-slate-400 mb-4">{track.artist}</p>
                            <div className="flex gap-3 flex-wrap">
                                <span className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border bg-cyan-500/10 text-cyan-300 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                                    {track.key}
                                </span>
                                <span className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                                    {track.bpm} BPM
                                </span>
                                <span className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border bg-pink-500/10 text-pink-300 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                                    {track.genre}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Waveform Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-8 rounded-3xl mb-8"
                >
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Activity className="w-6 h-6 text-cyan-400" />
                        Waveform Analysis
                    </h2>
                    <div ref={waveformRef} className="w-full h-32 rounded-xl bg-black/20 border border-white/5 flex items-center justify-center overflow-hidden">
                        {/* Placeholder waveform visualization */}
                        <div className="flex items-center gap-1 h-full w-full justify-center">
                            {[...Array(100)].map((_, i) => {
                                const height = Math.sin(i * 0.2) * 30 + Math.random() * 30 + 20
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: i * 0.01, duration: 0.5 }}
                                        className="w-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full opacity-60"
                                    />
                                )
                            })}
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mt-4 text-center">
                        Real-time waveform will display when audio file is available
                    </p>
                </motion.div>

                {/* Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Musical Analysis */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-panel p-8 rounded-3xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Music className="w-5 h-5 text-purple-400" />
                            Musical Analysis
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-slate-400">Tempo</span>
                                <span className="text-white font-mono text-lg font-bold">{track.bpm} BPM</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-slate-400">Key</span>
                                <span className="text-cyan-300 font-bold">{track.key}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-slate-400">Texture</span>
                                <span className="text-purple-300 font-bold">{track.texture}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-400">Color</span>
                                <span className="text-pink-300 font-bold">{track.color}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Metadata & Tags */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel p-8 rounded-3xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            Metadata & Tags
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-slate-400">Artist</span>
                                <span className="text-white font-semibold">{track.artist}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-slate-400">Title</span>
                                <span className="text-white font-semibold">{track.title}</span>
                            </div>
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <span className="text-slate-400">Genre</span>
                                <span className="text-white font-semibold">{track.genre}</span>
                            </div>
                            <div className="pt-3">
                                <span className="text-slate-400 block mb-3">Analysis Tags</span>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                                        {track.texture} Texture
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                                        {track.color} Tone
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/5 text-slate-300 border border-white/10">
                                        Key: {track.key}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default TrackDetail
