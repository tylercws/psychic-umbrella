# DJ SaaS Application - Audio Analysis Webtool

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-green.svg)

A powerful, AI-driven audio analysis platform packaged in a stunning **Retro Cyberpunk/Terminal** interface. Designed for DJs and producers to get deep insights into their music library.

## 🌟 Key Features

### 🎛️ Advanced Audio Analysis

- **BPM & Key Detection**: Accurate tempo and musical key (Camelot scale) identification.
- **Mix Structure**: Automatically detects **Intro**, **Drop**, and **Outro** timestamps to help plan perfect transitions.
- **Energy & Danceability**: Quantifies track energy (Low/Mid/High) and danceability percentage.
- **Loudness**: Integrated LUFS mastering levels.
- **Vibe Analysis**: Classifies Texture (Rhythmic/Melodic) and Color (Dark/Bright).

### 🖥️ Retro Terminal UI

- **Immersive Design**: CRT scanlines, dithering shading, and phosphorescent glow effects.
- **Interactive Visualizers**: ASCII-style waveform and circular drop-zone visualizers.
- **Responsive Layout**: Optimized 16:9 full-screen experience with smooth entrance animations.
- **Detailed Track View**: "Matrix-style" breakdown of every analyzed track.

## 🚀 Getting Started

### Quick Start (Windows)

The easiest way to run the application is using the included PowerShell launcher. This script handles dependency checks, virtual environment creation, and launches both backend and frontend servers.

1. **Right-click** `start_app.ps1`.
2. Select **Run with PowerShell**.
3. The text-based launcher will check for Python/Node.js and start the services.

### Manual Setup

If you prefer to run services manually:

#### 1. Backend (Python/Flask)

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
```

*Server runs on `http://localhost:5000`*

#### 2. Frontend (React/Vite)

```bash
cd frontend
npm install
npm run dev
```

*UI runs on `http://localhost:5173`*

## 🛠️ Technology Stack

- **Frontend**:
  - [React](https://react.dev/) + [Vite](https://vitejs.dev/)
  - [Tailwind CSS v4](https://tailwindcss.com/) (Styling)
  - [Framer Motion](https://www.framer.com/motion/) (Animations)
  - [Lucide React](https://lucide.dev/) (Icons)
- **Backend**:
  - [Flask](https://flask.palletsprojects.com/) (API)
  - [Librosa](https://librosa.org/) (DSP & Analysis)
  - [PyLoudNorm](https://github.com/csteinmetz1/pyloudnorm) (Loudness)
  - [MusicBrainz](https://musicbrainz.org/) (Metadata)

## 📂 Project Structure

```
dj-saas/
├── backend/            # Python Flask API & Analysis Engine
│   ├── app.py          # API Endpoints
│   ├── engine.py       # Core Analysis Logic
│   └── requirements.txt
├── frontend/           # React Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # UI Components (Visualizers, Stats)
│   │   │   └── pages/      # Dashboard & Track Detail views
│   └── vite.config.ts
└── start_app.ps1       # One-click launcher script
```

---
*Built with code & aesthetics.*
