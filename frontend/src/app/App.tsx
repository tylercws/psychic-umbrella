import { BrowserRouter, Routes, Route, HashRouter, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DitheringPattern } from './components/DitheringPattern';
import Dashboard from './pages/Dashboard';
import TrackDetail from './pages/TrackDetail';

function AnimatedRoutes({ tracks, handleFile, analyzing, progressMessage }: any) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard tracks={tracks} handleFile={handleFile} analyzing={analyzing} progressMessage={progressMessage} />} />
        <Route path="/track/:id" element={<TrackDetail />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  const handleFile = async (file: File) => {
    console.log("[handleFile] Starting upload for:", file.name);
    setAnalyzing(true);
    setProgressMessage("INITIATING SCAN...");
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        body: formData,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;
            try {
              const msg = JSON.parse(line);
              if (msg.type === 'progress') {
                setProgressMessage(msg.message.toUpperCase());
              } else if (msg.type === 'complete') {
                setTracks(prev => [msg.data, ...prev]);
              } else if (msg.type === 'error') {
                console.error(msg.message);
                alert("ERR: " + msg.message);
              }
            } catch (e) {
              console.error("Parse error", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
      // For demo purposes, if backend fails, mock a track so UI can be tested
      // alert("SYSTEM_OFFLINE: Backend not responding.");
    } finally {
      setAnalyzing(false);
      setProgressMessage("");
    }
  };

  return (
    <HashRouter>
      <div
        className="min-h-screen bg-black text-white relative overflow-hidden"
        style={{
          fontFamily: 'VT323, monospace',
          imageRendering: 'pixelated',
        }}
      >
        {/* Global Background Effects */}
        <DitheringPattern />

        {/* CRT Scanlines */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 opacity-20"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.8) 2px, rgba(0, 0, 0, 0.8) 4px)' }}
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Moving Grid */}
        <motion.div
          className="fixed inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, #aaaaaa 0px, #aaaaaa 1px, transparent 1px, transparent 8px)`,
            backgroundSize: '8px 8px',
            imageRendering: 'pixelated',
          }}
          animate={{ backgroundPosition: ['0px 0px', '8px 8px'] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />

        {/* ASCII Noise */}
        <motion.div
          className="fixed inset-0 opacity-5 pointer-events-none text-[8px] leading-none overflow-hidden"
          style={{ fontFamily: 'VT323, monospace', color: '#ffffff' }}
          animate={{ opacity: [0.03, 0.07, 0.03] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 3 + (i % 5), repeat: Infinity, ease: "linear" }}
            >
              {Array.from({ length: 200 }).map(() => String.fromCharCode(33 + Math.floor(Math.random() * 94))).join('')}
            </motion.div>
          ))}
        </motion.div>

        <AnimatedRoutes tracks={tracks} handleFile={handleFile} analyzing={analyzing} progressMessage={progressMessage} />

      </div>
    </HashRouter>
  );
}
