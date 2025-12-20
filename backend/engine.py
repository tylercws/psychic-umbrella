import os
import numpy as np
import librosa
import musicbrainzngs
import re
import json

# Initialize MusicBrainz
musicbrainzngs.set_useragent("GeminiDJ", "1.0", "contact@gemini.com")

def analyze_audio(filepath):
    try:
        # Load 90s for analysis
        yield json.dumps({"type": "progress", "message": "Loading audio file...", "percent": 10}) + "\n"
        y, sr = librosa.load(filepath, duration=90)
        
        # 1. BPM & Key
        yield json.dumps({"type": "progress", "message": "Detecting BPM & Key...", "percent": 30}) + "\n"
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
        bpm = int(round(tempo[0]))
        key = get_camelot_key(y, sr)
        
        # 2. Texture & Color
        yield json.dumps({"type": "progress", "message": "Analyzing Texture...", "percent": 60}) + "\n"
        texture, color = analyze_texture_and_color(y, sr)
        
        # 3. Meta (MusicBrainz)
        yield json.dumps({"type": "progress", "message": "Fetching Metadata...", "percent": 80}) + "\n"
        filename = os.path.basename(filepath)
        meta = fetch_metadata(filename)
        
        result = {
            "bpm": bpm,
            "key": key,
            "texture": texture,
            "color": color,
            "artist": meta.get('artist', 'Unknown'),
            "title": meta.get('title', clean_filename_str(filename)),
            "genre": f"{texture} {color}"
        }
        
        yield json.dumps({"type": "complete", "data": result}) + "\n"

    except Exception as e:
        import traceback
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"Error in analyze_audio: {error_msg}")
        print(traceback.format_exc())
        yield json.dumps({"type": "error", "message": error_msg}) + "\n"

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
        # Simplified correlation (Major/Minor templates)
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
    s = os.path.splitext(s)[0]
    s = s.replace("_", " ")
    return s.strip()

def fetch_metadata(filename):
    try:
        query = clean_filename_str(filename)
        res = musicbrainzngs.search_recordings(query=query, limit=1)
        if res['recording-list']:
            t = res['recording-list'][0]
            return {
                'artist': t['artist-credit'][0]['artist']['name'],
                'title': t['title']
            }
    except: pass
    return {}
