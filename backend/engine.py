import os
import numpy as np
import librosa
import musicbrainzngs
import re
import json
import pyloudnorm as pyln
import requests
import soundfile as sf
import traceback

# Initialize MusicBrainz
musicbrainzngs.set_useragent("GeminiDJ", "2.0", "contact@gemini.com")

def analyze_audio(filepath):
    try:
        # Load 180s for analysis (improved from 90s for drop/outro detection)
        yield json.dumps({"type": "progress", "message": "Loading audio file (3 mins)...", "percent": 5}) + "\n"
        y, sr = librosa.load(filepath, duration=180)
        total_duration = librosa.get_duration(y=y, sr=sr)
        
        # 1. BPM & Key
        yield json.dumps({"type": "progress", "message": "Detecting BPM & Key...", "percent": 20}) + "\n"
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
        bpm = float(tempo[0])
        key = get_camelot_key(y, sr)
        
        # 2. Advanced Signal Processing (Texture, Color, Loudness, Dance)
        yield json.dumps({"type": "progress", "message": "Analyzing Texture & Dynamics...", "percent": 40}) + "\n"
        texture, color = analyze_texture_and_color(y, sr)
        
        # Loudness (LUFS)
        try:
            meter = pyln.Meter(sr) 
            loudness = meter.integrated_loudness(y)
        except:
            loudness = -14.0 # Fallback
            
        # Danceability
        dance = detect_danceability(y, sr, bpm)
        
        # 3. Structure Analysis (Mix Points, Drops)
        yield json.dumps({"type": "progress", "message": "Analyzing Structure...", "percent": 60}) + "\n"
        intro_end, outro_start = find_mix_points(y, sr, total_duration)
        drop_time = detect_drop(y, sr)
        
        # 4. Meta (MusicBrainz Rich)
        yield json.dumps({"type": "progress", "message": "Fetching Rich Metadata...", "percent": 80}) + "\n"
        filename = os.path.basename(filepath)
        meta = fetch_metadata_rich(filename)
        
        # Determine Energy Level
        if bpm > 130: energy = "High"
        elif bpm < 100: energy = "Low"
        else: energy = "Mid"
        if dance > 80: energy = "High" # Boost energy if very danceable
        
        # Heuristic Genre
        genre_heuristic = guess_genre_by_bpm(bpm)
        
        result = {
            "bpm": int(round(bpm)),
            "key": key,
            "texture": texture,
            "color": color,
            "loudness": round(loudness, 1),
            "danceability": dance,
            "energy_level": energy,
            "mix_points": {
                "intro_end": intro_end,
                "outro_start": outro_start,
                "drop": format_time(drop_time) if drop_time else None
            },
            "meta": {
                "artist": meta.get('artist', 'Unknown Artist'),
                "title": meta.get('title', clean_filename_str(filename)),
                "remixer": meta.get('remixer', ''),
                "year": meta.get('year', ''),
                "cover_art": meta.get('cover_art_url', None)
            },
            "genre_heuristic": genre_heuristic,
            "genre": f"{texture} {color}" # Legacy style genre
        }
        
        yield json.dumps({"type": "complete", "data": result}) + "\n"

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"Error in analyze_audio: {error_msg}")
        print(traceback.format_exc())
        yield json.dumps({"type": "error", "message": error_msg}) + "\n"

# --- HELPER FUNCTIONS ---

def detect_danceability(y, sr, bpm):
    try:
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        pulse = librosa.beat.plp(onset_envelope=onset_env, sr=sr)
        beat_strength = np.mean(pulse)
        return min(100, int(beat_strength * 100 * 1.5))
    except:
        return 50

def analyze_texture_and_color(y, sr):
    try:
        y_slice = y[:sr*30]
        y_harm, y_perc = librosa.effects.hpss(y_slice)
        harm_energy = np.mean(librosa.feature.rms(y=y_harm))
        perc_energy = np.mean(librosa.feature.rms(y=y_perc))
        
        if perc_energy > harm_energy * 1.5: texture = "Rhythmic"
        elif harm_energy > perc_energy * 1.2: texture = "Melodic"
        else: texture = "Balanced"

        cent = librosa.feature.spectral_centroid(y=y_slice, sr=sr)
        avg_cent = np.mean(cent)
        
        if avg_cent < 1500: color = "Deep"
        elif avg_cent < 2500: color = "Warm"
        elif avg_cent < 3500: color = "Crisp"
        else: color = "Bright"
        
        return texture, color
    except: return "Balanced", "Warm"

def detect_drop(y, sr):
    try:
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        rms = librosa.feature.rms(y=y)[0]
        rms = librosa.util.fix_length(rms, size=len(onset_env))
        energy = onset_env * rms
        
        window_size = int(sr * 2.0 / 512)
        energy_smooth = np.convolve(energy, np.ones(window_size)/window_size, mode='same')
        
        skip_samples = int(30 * sr / 512) # Skip first 30s (intro)
        if len(energy_smooth) > skip_samples:
            valid_section = energy_smooth[skip_samples:]
            max_idx = np.argmax(valid_section) + skip_samples
            times = librosa.times_like(onset_env, sr=sr)
            return times[max_idx]
        return None
    except: return None

def find_mix_points(y, sr, duration_sec):
    try:
        intro_end = "00:00"
        outro_start = "00:00"
        
        # Intro: Analyze first 45s
        intro_dur = min(45, duration_sec / 4)
        y_intro = y[:int(intro_dur*sr)]
        rms_intro = librosa.feature.rms(y=y_intro)[0]
        if len(rms_intro) > 0:
            times = librosa.times_like(rms_intro, sr=sr)
            threshold = np.max(rms_intro) * 0.6
            jump_idx = np.where(rms_intro > threshold)[0]
            if len(jump_idx) > 0:
                intro_end = format_time(times[jump_idx[0]])

        # Outro: Analyze last 45s
        outro_dur = min(45, duration_sec / 4)
        y_outro = y[-int(outro_dur*sr):]
        rms_outro = librosa.feature.rms(y=y_outro)[0]
        if len(rms_outro) > 0:
            times_outro = librosa.times_like(rms_outro, sr=sr)
            threshold_out = np.max(rms_outro) * 0.4
            # Look for where it drops below threshold, searching from end backwards could be better but this works
            # Actually, let's find the LAST time it was loud, which is the start of the fade out
            loud_idx = np.where(rms_outro > threshold_out)[0]
            if len(loud_idx) > 0:
                last_loud = loud_idx[-1]
                # Calculate absolute time
                start_offset = duration_sec - outro_dur
                abs_time = start_offset + times_outro[last_loud]
                outro_start = format_time(abs_time)
        
        return intro_end, outro_start
    except: return "00:00", "00:00"

def get_camelot_key(y, sr):
    CAMELOT_MAP = {
        'C': '8B', 'Am': '8A', 'G': '9B', 'Em': '9A', 'D': '10B', 'Bm': '10A',
        'A': '11B', 'F#m': '11A', 'E': '12B', 'C#m': '12A', 'B': '1B', 'G#m': '1A',
        'F#': '2B', 'D#m': '2A', 'Gb': '2B', 'Ebm': '2A', 'Db': '3B', 'Bbm': '3A',
        'C#': '3B', 'A#m': '3A', 'Ab': '4B', 'Fm': '4A', 'G#': '4B', 
        'Eb': '5B', 'Cm': '5A', 'D#': '5B', 'Bb': '6B', 'Gm': '6A',
        'A#': '6B', 'F': '7B', 'Dm': '7A'
    }
    try:
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_avg = np.mean(chroma, axis=1)
        maj_template = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]
        min_template = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0]
        maj_corrs = [np.corrcoef(chroma_avg, np.roll(maj_template, i))[0, 1] for i in range(12)]
        min_corrs = [np.corrcoef(chroma_avg, np.roll(min_template, i))[0, 1] for i in range(12)]
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        if np.max(maj_corrs) > np.max(min_corrs):
            root = notes[np.argmax(maj_corrs)]
            return CAMELOT_MAP.get(root, root)
        else:
            root = notes[np.argmax(min_corrs)]
            return CAMELOT_MAP.get(root + "m", root + "m")
    except: return "12A"

def clean_filename_str(s):
    s = re.sub(r'[\\/*?:\"<>|]', "", s)
    s = re.sub(r'\(Official.*?\)', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\[Official.*?]', '', s, flags=re.IGNORECASE)
    s = s.replace("_", " ")
    return s.strip()

def format_time(seconds):
    return f"{int(seconds//60):02d}:{int(seconds%60):02d}"

def guess_genre_by_bpm(bpm):
    if 60 <= bpm <= 90: return "Dub / Hip-Hop"
    if 90 < bpm <= 115: return "Mid-Tempo"
    if 115 < bpm <= 126: return "House / Disco"
    if 126 < bpm <= 138: return "Techno / Trance"
    if 138 < bpm <= 155: return "Dubstep / Trap"
    if 155 < bpm <= 180: return "Drum & Bass"
    return "Electronic"

def fetch_metadata_rich(filename):
    meta = {}
    try:
        query = clean_filename_str(os.path.splitext(filename)[0])
        res = musicbrainzngs.search_recordings(query=query, limit=1)
        if res['recording-list']:
            t = res['recording-list'][0]
            meta['artist'] = t['artist-credit'][0]['artist']['name']
            meta['title'] = t['title']
            meta['year'] = t.get('date', '')[:4]
            # Try to find release ID for cover art
            if 'release-list' in t:
                release_id = t['release-list'][0]['id']
                meta['release_id'] = release_id
                meta['cover_art_url'] = f"http://coverartarchive.org/release/{release_id}/front"
    except: pass
    return meta
