import { Routes, Route, HashRouter, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { DitheringPattern } from './components/DitheringPattern';
import Dashboard from './pages/Dashboard';
import TrackDetail from './pages/TrackDetail';
import { springPresets } from './motion/motionTokens';

function AnimatedRoutes({ tracks, handleFile, handleReAnalyze, analyzing, progressMessage, selectedModel, setSelectedModel }: any) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <Dashboard
            tracks={tracks}
            handleFile={handleFile}
            analyzing={analyzing}
            progressMessage={progressMessage}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        } />
        <Route path="/track/:id" element={
          <TrackDetail
            onReAnalyze={handleReAnalyze}
            isAnalyzing={analyzing}
            progressMessage={progressMessage}
          />
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState<"htdemucs_6s" | "htdemucs_ft">("htdemucs_6s");

  const handleFile = async (file: File, overrideModel?: string) => {
    console.log("[handleFile] Starting upload for:", file.name, "with model:", overrideModel || selectedModel);
    setAnalyzing(true);
    setProgressMessage("INITIATING SCAN...");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', overrideModel || selectedModel);

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
                // Update tracks: if it's a re-analysis, replace the old one
                setTracks(prev => {
                  const exists = prev.findIndex(t => t.meta?.filename === msg.data.meta?.filename);
                  if (exists !== -1) {
                    const newTracks = [...prev];
                    newTracks[exists] = msg.data;
                    return newTracks;
                  }
                  return [msg.data, ...prev];
                });
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

  const handleReAnalyze = async (filename: string, model: string) => {
    console.log("[handleReAnalyze] Re-analyzing:", filename, "with model:", model);
    setAnalyzing(true);
    setProgressMessage("RE-INITIATING SCAN...");

    try {
      const response = await fetch('http://localhost:5000/re-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, model }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error || `Re-analyze failed with status ${response.status}`);
      }

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
                setTracks(prev => {
                  const exists = prev.findIndex(t => t.meta?.filename === msg.data.meta?.filename);
                  if (exists !== -1) {
                    const newTracks = [...prev];
                    newTracks[exists] = msg.data;
                    return newTracks;
                  }
                  return [msg.data, ...prev];
                });
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
    } finally {
      setAnalyzing(false);
      setProgressMessage("");
    }
  };

  return (
    <MotionConfig reducedMotion="user" transition={springPresets.soft}>
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

          <AnimatedRoutes
            tracks={tracks}
            handleFile={handleFile}
            handleReAnalyze={handleReAnalyze}
            analyzing={analyzing}
            progressMessage={progressMessage}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />

        </div>
      </HashRouter>
    </MotionConfig>
  );
}
