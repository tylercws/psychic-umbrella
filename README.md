# DJ SaaS Application

Welcome to the **DJ SaaS** codebase! This application provides an advanced, AI-powered audio analysis platform for DJs and music producers. It combines a modern, responsive React frontend with a powerful Python-based audio processing engine.

## 🌟 Overview

The application allows users to upload audio files (MP3, WAV, etc.) and instantly receive detailed musical analysis, including:

- **BPM (Beats Per Minute)** extraction
- **Musical Key** detection (Camelot scale)
- **Texture & Color** classification (Rhythmic/Melodic, Warm/Bright)
- **Metadata fetching** via MusicBrainz

## 🏗️ Architecture

The system follows a decoupled client-server architecture:

```mermaid
graph TD
    subgraph "Frontend (Client)"
        UI[User Interface / React]
        Store[State Management]
    end

    subgraph "Backend (Server)"
        API[Flask API Layer]
        Engine[Audio Analysis Engine]
    end

    subgraph "External Services"
        MB[MusicBrainz API]
    end

    %% Data Flow
    UI -->|1. Upload Audio File| API
    API -->|2. Save Temp File| API
    API -->|3. Invoke Analysis| Engine
    Engine -->|4. Signal Processing (Librosa)| Engine
    Engine -->|5. Fetch Meta (Artist/Title)| MB
    MB -.->|6. Return Meta| Engine
    Engine -->|7. Return Analysis Data| API
    API -->|8. JSON Response| UI

    %% Styling
    style UI fill:#61dafb,stroke:#333,stroke-width:2px,color:black
    style API fill:#ffd43b,stroke:#333,stroke-width:2px,color:black
    style Engine fill:#ff6b6b,stroke:#333,stroke-width:2px,color:white
```

### Components

1. **Frontend (`/frontend`)**
    - **Framework**: React (Vite)
    - **Styling**: TailwindCSS & Framer Motion (for animations like glassmorphism and transitions).
    - **Logic**: `App.jsx` handles the file upload, communicates with the backend via Axios, and renders the dashboard.

2. **Backend (`/backend`)**
    - **Server**: Flask (Python).
    - **API**: Exposes a single endpoint `POST /analyze` that accepts multipart form data.
    - **Processing**: `engine.py` uses `Librosa` for DSP (Digital Signal Processing) to extract features like spectral centroid (Color) and harmonic/percussive separation (Texture).

## 🚀 Getting Started

Follow these instructions to run the project locally.

### Prerequisites

- Node.js & npm
- Python 3.8+

### 1. Backend Setup

Navigate to the backend directory and set up the Python environment.

```bash
cd backend

# Create virtual environment (Optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

*Server runs on `http://localhost:5000`*

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory.

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

*Frontend runs on `http://localhost:5173` (typically)*

## 🧠 Key Features

- **Glassmorphism UI**: A premium, dark-mode aesthetic.
- **Real-time Feedback**: Interactive upload states and animations.
- **Smart Classification**: Automatically categorizes tracks by "Vibe" (Texture/Color).
