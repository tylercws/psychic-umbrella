import { useState, useRef, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import axios from 'axios'
import {
  Upload, Music, Disc, Activity, Zap, Play,
  LayoutDashboard, Library, Settings, Search,
  Menu, X, BarChart3, Waves, Clock, ListMusic, MoreHorizontal
} from 'lucide-react'
import TrackDetail from './components/TrackDetail'

// --- ANIMATION CONFIG ---
const springConfig = { type: "spring", stiffness: 300, damping: 30 }
const floatAnim = {
  y: [0, -10, 0],
  transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
}

const staggeredList = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const listItem = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

// --- COMPONENTS ---

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const ref = useRef(null)

  const rotateX = useTransform(y, [-100, 100], [10, -10])
  const rotateY = useTransform(x, [-100, 100], [-10, 10])

  const handleMouseMove = (event) => {
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      className={`glass-panel overflow-hidden relative group cursor-pointer ${className}`}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      whileTap={{ scale: 0.95 }} // Squash
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
      {children}
    </motion.div>
  )
}

const Sidebar = ({ activeTab, setActiveTab }) => (
  <motion.div
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={springConfig}
    className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 glass-nav z-50 p-6"
  >
    <div className="flex items-center gap-4 mb-12 pl-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
      >
        <Disc className="w-5 h-5 text-white" />
      </motion.div>
      <h1 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
        GEMINI <span className="font-thin text-cyan-400">DJ</span>
      </h1>
    </div>

    <nav className="flex-1 space-y-2">
      {[
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'library', icon: Library, label: 'My Library' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'settings', icon: Settings, label: 'Settings' },
      ].map((item) => (
        <div key={item.id} className="relative group">
          {activeTab === item.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-xl border-l-2 border-cyan-400"
              transition={springConfig}
            />
          )}
          <motion.button
            onClick={() => setActiveTab(item.id)}
            whileHover={{ x: 5 }} // Anticipation
            whileTap={{ scale: 0.95 }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative z-10 ${activeTab === item.id ? 'text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium tracking-wide">{item.label}</span>
          </motion.button>
        </div>
      ))}
    </nav>
  </motion.div>
)

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <TiltCard className="p-6 rounded-3xl h-full flex flex-col justify-between">
    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:scale-150 transition-transform duration-700 ${color}`} />

    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${color.replace('bg-', 'text-')}`}>
        <Icon className="w-6 h-6" />
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]"
      />
    </div>

    <div className="relative z-10">
      <h3 className="text-4xl font-bold text-white mb-1 tracking-tight glow-text">{value}</h3>
      <p className="text-sm font-medium text-slate-400 uppercase tracking-widest text-[10px]">{label}</p>
      {sub && <div className="mt-2 text-xs text-white/50">{sub}</div>}
    </div>
    <div className="shimmer opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300" />
  </TiltCard>
)

const FileUpload = ({ onFile, isAnalyzing, progressMessage }) => {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
    else if (e.type === "dragleave") setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0])
  }

  return (
    <motion.div
      layout
      onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload').click()}
      animate={dragActive ? { scale: 1.02, borderColor: "#22d3ee", backgroundColor: "rgba(34, 211, 238, 0.1)" } : { scale: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.03)" }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,255,255,0.1)" }}
      whileTap={{ scale: 0.98 }}
      className={`glass-panel border-2 border-dashed rounded-3xl h-80 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden group`}
    >
      <input type="file" id="file-upload" className="hidden" onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} accept=".mp3,.m4a,.wav,.opus" />

      <AnimatePresence mode='wait'>
        {isAnalyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            className="flex flex-col items-center z-10"
          >
            <div className="flex items-center gap-1 h-20 mb-6">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [20, 80, 20], backgroundColor: ["#22d3ee", "#a855f7", "#22d3ee"] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1, ease: "easeInOut" }}
                  className="w-3 rounded-full shadow-[0_0_15px_currentColor]"
                />
              ))}
            </div>
            <p className="text-cyan-300 font-bold animate-pulse tracking-widest text-sm uppercase">{progressMessage || "DECODING SONIC DNA..."}</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center z-10 text-center"
          >
            <div className={`w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10`}>
              <Upload className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Drop Audio Source</h3>
            <p className="text-slate-400 text-sm max-w-[200px]">Supports MP3, WAV, FLAC. Unleash the analysis engine.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const TrackRow = ({ track, index }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/track/${index}`, { state: { track } })
  }

  return (
    <motion.tr
      variants={listItem}
      onClick={handleClick}
      className="border-b border-white/5 table-row-hover group cursor-pointer"
      whileHover={{ backgroundColor: "rgba(6, 182, 212, 0.05)" }}
    >
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 90, scale: 1.1 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-black border border-white/10 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-inner"
          >
            {track.key || "?"}
          </motion.div>
          <div>
            <div className="font-bold text-white text-lg tracking-tight group-hover:text-cyan-300 transition-colors">{track.title}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">{track.artist}</div>
          </div>
        </div>
      </td>
      <td className="py-5 px-6 font-mono text-cyan-300 text-lg">{track.bpm} <span className="text-xs text-slate-600">BPM</span></td>
      <td className="py-5 px-6">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${track.texture === "Melodic"
          ? "bg-purple-500/10 text-purple-300 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
          : "bg-yellow-500/10 text-yellow-300 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
          }`}>
          {track.texture}
        </span>
      </td>
      <td className="py-5 px-6">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${'bg-pink-500/10 text-pink-300 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.2)]'
          }`}>
          {track.color}
        </span>
      </td>
      <td className="py-5 px-6 text-right">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 text-slate-500 hover:text-white transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </td>
    </motion.tr>
  )
}

// --- MAIN APP ---

// Dashboard Component (outside App to prevent re-creation on state updates)
const Dashboard = ({ activeTab, setActiveTab, tracks, analyzing, progressMessage, handleFile, avgBpm, dominantKey }) => (
  <div className="min-h-screen w-full relative">
    {/* Background Blobs */}
    <div className="blob-cont">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
    </div>

    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

    <main className="md:ml-72 p-6 md:p-10 min-h-screen relative z-10 overflow-hidden">
      <AnimatePresence mode='wait'>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top Bar */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <motion.h2
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="text-4xl font-black text-white mb-2 tracking-tight"
              >
                DASHBOARD
              </motion.h2>
              <div className="h-1 w-20 bg-cyan-500 rounded-full shadow-[0_0_15px_#06b6d4]" />
            </div>

            <div className="flex items-center gap-6">
              <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 text-slate-300">
                <Search className="w-4 h-4" />
                <span className="text-sm font-medium">Search library...</span>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 border-2 border-white/20 shadow-lg cursor-pointer" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <StatCard icon={ListMusic} label="Tracks Analyzed" value={tracks.length} color="bg-purple-600" />
            <StatCard icon={Activity} label="Avg Intensity" value={avgBpm} sub="BPM" color="bg-cyan-500" />
            <StatCard icon={Music} label="Dominant Key" value={dominantKey} color="bg-pink-500" />
            <StatCard icon={Waves} label="Current Vibe" value={tracks.length ? tracks[0].texture : '-'} color="bg-orange-500" />
          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Left: Upload */}
            <div className="lg:col-span-1 space-y-8">
              <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> INPUT SOURCE
              </h3>
              <FileUpload onFile={handleFile} isAnalyzing={analyzing} progressMessage={progressMessage} />

              <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Disc className="w-32 h-32" /></div>
                <h4 className="text-lg font-bold text-white mb-4">Pro Tips</h4>
                <ul className="space-y-4 text-sm text-slate-400">
                  <li className="flex gap-3 items-center"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" /> Drop folders to batch analyze.</li>
                  <li className="flex gap-3 items-center"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_#22d3ee]" /> AI detects texture deviations.</li>
                </ul>
              </div>
            </div>

            {/* Right: Library */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" /> RECENT SCANS
                </h3>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 rounded-full bg-white/5 hover:bg-white/10 text-cyan-300 text-sm font-bold border border-white/5 transition-colors">
                  EXPORT DATA
                </motion.button>
              </div>

              <div className="glass-panel rounded-3xl overflow-hidden min-h-[500px] shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-xs font-bold text-slate-500 uppercase tracking-widest bg-black/20">
                      <th className="py-5 px-6">Track Info</th>
                      <th className="py-5 px-6">Tempo</th>
                      <th className="py-5 px-6">Texture</th>
                      <th className="py-5 px-6">Color</th>
                      <th className="py-5 px-6 text-right"></th>
                    </tr>
                  </thead>
                  <motion.tbody variants={staggeredList} initial="hidden" animate="show">
                    {tracks.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-32 text-center text-slate-500">
                          <motion.div animate={floatAnim} className="inline-block">
                            <Music className="w-16 h-16 mx-auto mb-4 opacity-20" />
                          </motion.div>
                          <p className="text-lg">Library Empty. Feed the engine.</p>
                        </td>
                      </tr>
                    ) : (
                      tracks.map((t, i) => <TrackRow key={i} track={t} index={i} />)
                    )}
                  </motion.tbody>
                </table>
              </div>
            </div>

          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  </div>
)

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tracks, setTracks] = useState([])
  const [analyzing, setAnalyzing] = useState(false)
  const [progressMessage, setProgressMessage] = useState("")

  // Debug: Log when tracks change
  useEffect(() => {
    console.log("[App] Tracks state updated. Length:", tracks.length, "Data:", tracks)
  }, [tracks])

  // Computed Stats - simplified and safe
  const avgBpm = tracks.length > 0
    ? Math.round(tracks.reduce((acc, t) => acc + (t.bpm || 0), 0) / tracks.length)
    : 0

  const dominantKey = (() => {
    if (tracks.length === 0) return '-'
    const keyCounts = {}
    tracks.forEach(t => {
      if (t.key) keyCounts[t.key] = (keyCounts[t.key] || 0) + 1
    })
    const sortedKeys = Object.entries(keyCounts).sort((a, b) => b[1] - a[1])
    return sortedKeys.length > 0 ? sortedKeys[0][0] : '-'
  })()

  const handleFile = async (file) => {
    console.log("[handleFile] Starting upload for:", file.name)
    setAnalyzing(true)
    setProgressMessage("Initiating upload...")
    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log("[handleFile] Sending fetch request...")
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      })
      console.log("[handleFile] Response received, status:", response.status)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) {
          console.log("[handleFile] Stream done. Remaining buffer:", buffer)
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        console.log("[handleFile] Received chunk:", chunk)
        buffer += chunk
        const lines = buffer.split('\n')

        // Keep the last element in the buffer as it might be incomplete
        buffer = lines.pop()

        for (const line of lines) {
          if (line.trim() === '') continue
          console.log("[handleFile] Parsing line:", line)
          try {
            const msg = JSON.parse(line)
            console.log("[handleFile] Parsed message:", msg)
            if (msg.type === 'progress') {
              setProgressMessage(msg.message)
            } else if (msg.type === 'complete') {
              console.log("[handleFile] ADDING TRACK:", msg.data)
              setTracks(prev => [msg.data, ...prev])
            } else if (msg.type === 'error') {
              console.error(msg.message)
              alert("Analysis Error: " + msg.message)
            }
          } catch (e) {
            console.error("[handleFile] Error parsing JSON chunk:", e, "Line was:", line)
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim() !== '') {
        console.log("[handleFile] Processing remaining buffer:", buffer)
        try {
          const msg = JSON.parse(buffer)
          console.log("[handleFile] Parsed remaining buffer:", msg)
          if (msg.type === 'complete') {
            console.log("[handleFile] ADDING TRACK from remaining buffer:", msg.data)
            setTracks(prev => [msg.data, ...prev])
          }
        } catch (e) {
          console.error("[handleFile] Failed to parse remaining buffer:", e)
        }
      }
    } catch (err) {
      console.error("[handleFile] Fetch error:", err)
      alert("Backend offline. Start Flask server.")
    } finally {
      console.log("[handleFile] Finished, setting analyzing to false")
      setAnalyzing(false)
      setProgressMessage("")
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              tracks={tracks}
              analyzing={analyzing}
              progressMessage={progressMessage}
              handleFile={handleFile}
              avgBpm={avgBpm}
              dominantKey={dominantKey}
            />
          }
        />
        <Route path="/track/:id" element={<TrackDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
