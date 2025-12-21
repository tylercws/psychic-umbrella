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
import subprocess
import torch
import shutil
import glob
from scipy import signal

# Initialize MusicBrainz
musicbrainzngs.set_useragent("GeminiDJ", "2.0", "contact@gemini.com")


def analyze_audio(filepath, model_name='htdemucs_6s'):
    try:
        # Load 180s for quick analysis first (BPM, Key, etc)
        yield json.dumps({"type": "progress", "message": "Loading audio file...", "percent": 5}) + "\n"
        y, sr = librosa.load(filepath, duration=180)
        total_duration = librosa.get_duration(y=y, sr=sr)
        
        # 1. BPM & Key
        yield json.dumps({"type": "progress", "message": "Detecting BPM & Key...", "percent": 10}) + "\n"
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
        bpm = float(tempo[0])
        key = get_camelot_key(y, sr)
        
        # 2. Metadata
        yield json.dumps({"type": "progress", "message": "Fetching metadata...", "percent": 20}) + "\n"
        filename = os.path.basename(filepath)
        meta = fetch_metadata_rich(filename)
        meta['filename'] = filename

        # 3. Demucs Separation
        yield json.dumps({"type": "progress", "message": f"Separating ({model_name})...", "percent": 30}) + "\n"
        
        out_dir = os.path.join(os.path.dirname(filepath), "separated")
        
        # Use Demucs with selected model
        stems_dict = separate_audio_demucs(filepath, out_dir, model_name=model_name)
        
        # 4. Drum Splitting (Kick/Hats)
        yield json.dumps({"type": "progress", "message": "Splitting Drums (Kick/Hats)...", "percent": 70}) + "\n"
        if "drums" in stems_dict:
            drum_y, _ = librosa.load(stems_dict["drums"], sr=sr)
            kick_y, hats_y = split_drums(drum_y, sr)
            
            base_name = os.path.splitext(filepath)[0]
            kick_path = f"{base_name}_kick.wav"
            hats_path = f"{base_name}_hats.wav"
            sf.write(kick_path, kick_y, sr)
            sf.write(hats_path, hats_y, sr)
            
            stems_dict["kick"] = kick_path
            stems_dict["hats"] = hats_path

        # 5. Generate Waveforms for UI
        yield json.dumps({"type": "progress", "message": "Generating Waveforms...", "percent": 80}) + "\n"
        
        # Load processed stems for waveforms
        # Helper to load and get waveform
        def get_wf(path):
            try:
                # Load duration limited if file is huge? No, we need sync.
                # Just load and resample quickly.
                y_stem, _ = librosa.load(path, sr=sr) 
                return generate_waveform(y_stem, sr, points=150)
            except: 
                return [0.0]*150

        y_full, _ = librosa.load(filepath, sr=sr)
        waveform = generate_waveform(y_full, sr)

        stem_waveforms = {}
        # Standard 7 Stems
        if "vocals" in stems_dict: stem_waveforms["vocal"] = get_wf(stems_dict["vocals"])
        if "bass" in stems_dict: stem_waveforms["bass"] = get_wf(stems_dict["bass"])
        if "kick" in stems_dict: stem_waveforms["kick"] = get_wf(stems_dict["kick"])
        if "hats" in stems_dict: stem_waveforms["hihats"] = get_wf(stems_dict["hats"])
        if "piano" in stems_dict: stem_waveforms["piano"] = get_wf(stems_dict["piano"])
        if "guitar" in stems_dict: stem_waveforms["guitar"] = get_wf(stems_dict["guitar"])
        if "other" in stems_dict: stem_waveforms["other"] = get_wf(stems_dict["other"])

        # 6. Advanced Analysis (Texture, etc)
        yield json.dumps({"type": "progress", "message": "Final Analysis...", "percent": 90}) + "\n"
        texture, color = analyze_texture_and_color(y, sr)
        drop_time = detect_drop(y, sr)
        mix_points = {"intro_end": "00:00", "outro_start": "00:00"} # Simplify or calc
        intro_end, outro_start = find_mix_points(y_full, sr, total_duration)
        mix_points = {"intro_end": intro_end, "outro_start": outro_start}

        # Cue Points calculation (using Vocals stem if available)
        cues = []
        if "vocals" in stems_dict:
            y_voc, _ = librosa.load(stems_dict["vocals"], sr=sr)
            cues = detect_cue_point_analysis(y_full, y_voc, sr, mix_points, drop_time)
        else:
            y_harm, _ = librosa.effects.hpss(y_full) # Fallback
            cues = detect_cue_point_analysis(y_full, y_harm, sr, mix_points, drop_time)
        # 6. MIDI Transcription (Melodic Stems)
        midi_files = {}
        melodic_stems = ["piano", "guitar", "bass"]
        
        for stem_name in melodic_stems:
            if stem_name in stems_dict and os.path.exists(stems_dict[stem_name]):
                yield json.dumps({"type": "progress", "message": f"Transcribing MIDI: {stem_name.upper()}...", "percent": 90}) + "\n"
                m_path = generate_midi_from_audio(stems_dict[stem_name], os.path.dirname(filepath))
                if m_path:
                    midi_files[stem_name] = os.path.basename(m_path)

        # Result Construction
        result = {
            "bpm": int(round(bpm)),
            "key": key,
            "texture": texture,
            "color": color,
            "loudness": -14.0, # Placeholder or calc
            "mix_points": {
                "intro_end": intro_end,
                "outro_start": outro_start,
                "drop": format_time(drop_time) if drop_time else None
            },
            "waveform": waveform,
            "stems": stem_waveforms,
            "stem_files": {
                "main": os.path.basename(filepath),
                "vocal": os.path.basename(stems_dict.get("vocals", "")),
                "bass": os.path.basename(stems_dict.get("bass", "")),
                "kick": os.path.basename(stems_dict.get("kick", "")),
                "hihats": os.path.basename(stems_dict.get("hats", "")),
                "piano": os.path.basename(stems_dict.get("piano", "")),
                "guitar": os.path.basename(stems_dict.get("guitar", "")),
                "other": os.path.basename(stems_dict.get("other", ""))
            },
            "midi_files": midi_files,
            "cues": cues,
            "meta": meta,
            "genre": f"{texture} {color}"
        }
        
        yield json.dumps({"type": "complete", "data": result}) + "\n"

    except Exception as e:
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"Error in analyze_audio: {error_msg}")
        print(traceback.format_exc())
        yield json.dumps({"type": "error", "message": error_msg}) + "\n"


# --- HELPER FUNCTIONS ---

def separate_audio_demucs(filepath, out_dir, model_name='htdemucs_6s'):
    """
    Separates audio using specified Demucs model.
    """
    try:
        import sys
        
        if not os.path.exists(out_dir):
            os.makedirs(out_dir)
            
        track_name = os.path.splitext(os.path.basename(filepath))[0]
        
        cmd = [
            sys.executable, "-m", "demucs.separate",
            "-n", model_name,
            "-o", "temp_audio/separated", 
            "--device", "cuda" if torch.cuda.is_available() else "cpu",
            filepath
        ]
        
        print(f"Running Demucs ({model_name}): {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
        
        demucs_out_dir = os.path.join("temp_audio", "separated", model_name, track_name)
        stems = {}
        
        target_dir = os.path.dirname(filepath)
        base_name = os.path.splitext(os.path.basename(filepath))[0]
        
        # All possible Demucs stems across both models
        demucs_stems = ["vocals", "drums", "bass", "other", "piano", "guitar"]
        
        for d_stem in demucs_stems:
            src = os.path.join(demucs_out_dir, f"{d_stem}.wav")
            if os.path.exists(src):
                dst = os.path.join(target_dir, f"{base_name}_{d_stem}.wav")
                shutil.copy2(src, dst)
                stems[d_stem] = dst
        
        # Cleanup
        shutil.rmtree(demucs_out_dir, ignore_errors=True)
                
        return stems
        
    except Exception as e:
        print(f"Demucs Error: {e}")
        print(traceback.format_exc())
        return {}

def generate_midi_from_audio(audio_path, output_dir):
    """
    Uses Spotify's basic-pitch to convert audio to MIDI.
    """
    try:
        from basic_pitch.inference import predict_and_save
        import tensorflow as tf
        
        # Suppress TF logging
        os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        
        # basic-pitch predict_and_save
        predict_and_save(
            audio_path_list=[audio_path],
            output_directory=output_dir,
            save_midi=True,
            save_model_outputs=False,
            save_notes=False
        )
        
        # basic-pitch names it {filename}_basic_pitch.mid
        base_name = os.path.splitext(os.path.basename(audio_path))[0]
        midi_path = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
        
        if os.path.exists(midi_path):
            return midi_path
        return None
    except Exception as e:
        print(f"MIDI Generation Error for {audio_path}: {e}")
        return None

def split_drums(y, sr):
    """
    Splits a Drum stem into Kick (Low) and Hats/Perc (High/Residual).
    """
    try:
        # Kick: Low Pass < 150Hz
        # 4th order Butterworth filter
        sos = signal.butter(4, 150, 'lp', fs=sr, output='sos')
        kick = signal.sosfilt(sos, y)
        
        # Hats/Perc: Subtract Kick or High Pass
        # High Pass > 150Hz
        sos_hp = signal.butter(4, 150, 'hp', fs=sr, output='sos')
        hats = signal.sosfilt(sos_hp, y)
        
        return kick, hats
    except:
        return y, y # Fallback

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

def detect_cue_point_analysis(y, y_harm, sr, mix_points=None, drop_time=None):
    cues = []
    try:
        # 1. Vocal Detection Heuristic
        rms_harm = librosa.feature.rms(y=y_harm, frame_length=2048, hop_length=512)[0]
        cent = librosa.feature.spectral_centroid(y=y_harm, sr=sr, n_fft=2048, hop_length=512)[0]
        
        # Normalize
        if np.max(rms_harm) > 0:
            rms_norm = (rms_harm - np.min(rms_harm)) / (np.max(rms_harm) - np.min(rms_harm))
        else:
            rms_norm = rms_harm

        # Vocal Freq Weight (Gaussian around 1500Hz)
        vocal_freq_weight = np.exp(- (cent - 1500)**2 / (2 * 1000**2))
        vocal_activity = rms_norm * vocal_freq_weight
        
        # Smooth
        window_size = int(sr * 2.0 / 512)
        vocal_smooth = np.convolve(vocal_activity, np.ones(window_size)/window_size, mode='same')
        
        is_vocal = vocal_smooth > 0.25 # Threshold
        times = librosa.times_like(vocal_activity, sr=sr)
        
        # Calculate avg vocal energy for classification
        all_vocal_energy = vocal_smooth[is_vocal]
        avg_vocal_energy = np.mean(all_vocal_energy) if len(all_vocal_energy) > 0 else 0
        
        current_start = None
        for i, active in enumerate(is_vocal):
            if active and current_start is None:
                current_start = times[i]
            elif not active and current_start is not None:
                duration = times[i] - current_start
                if duration > 4.0: # Min 4s
                    section_energy = np.mean(vocal_smooth[int(current_start*sr/512):int(times[i]*sr/512)])
                    # Classification
                    label = "VOCAL VERSE"
                    if section_energy > avg_vocal_energy * 1.2: label = "VOCAL CHORUS"
                    elif section_energy < avg_vocal_energy * 0.8: label = "VOCAL AD-LIB/BRIDGE"

                    cues.append({
                        "id": f"vocal_{len(cues)}",
                        "label": label,
                        "time": format_time(current_start),
                        "startTime": current_start,
                        "endTime": times[i],
                        "duration": round(duration, 1),
                        "type": "range",
                        "color": "#3b82f6" if "CHORUS" not in label else "#8b5cf6" # Blue vs Purple
                    })
                current_start = None

        # 2. Add Drops/Mix Points
        if mix_points:
            if mix_points['intro_end'] != "00:00":
                cues.append({"id": "intro", "label": "INTRO END", "time": mix_points['intro_end'], "startTime": time_to_seconds_raw(mix_points['intro_end']), "type": "point", "color": "#10b981"})
            if mix_points['outro_start'] != "00:00":
                cues.append({"id": "outro", "label": "OUTRO START", "time": mix_points['outro_start'], "startTime": time_to_seconds_raw(mix_points['outro_start']), "type": "point", "color": "#ef4444"})
        
        if drop_time:
             cues.append({"id": "drop", "label": "DROP", "time": format_time(drop_time), "startTime": drop_time, "type": "point", "color": "#f59e0b"})

        # Sort by time
        cues.sort(key=lambda x: x['startTime'])
        return cues

    except Exception as e:
        print(f"Cue detection error: {e}")
        return []

def time_to_seconds_raw(t_str):
    try:
        m, s = map(int, t_str.split(':'))
        return m*60 + s
    except: return 0

def generate_waveform(y, sr, points=150):
    try:
        # Downsample to 'points' number of amplitude peaks
        hop_length = len(y) // points
        if hop_length < 1: hop_length = 1
        
        waveform = []
        for i in range(points):
            segment = y[i*hop_length : (i+1)*hop_length]
            if len(segment) > 0:
                val = float(np.max(np.abs(segment)))
                waveform.append(val)
            else:
                waveform.append(0.0)
        
        # Normalize
        max_val = max(waveform) if waveform else 0
        if max_val > 0:
            waveform = [float(round(v / max_val, 3)) for v in waveform]
        
        return waveform
    except:
        return [0.0] * points

def analyze_spectral_contrast(y, sr):
    try:
        S = np.abs(librosa.stft(y))
        contrast = librosa.feature.spectral_contrast(S=S, sr=sr)
        mean_contrast = np.mean(contrast)
        
        if mean_contrast < 15: return "Flat"
        if mean_contrast < 20: return "Natural"
        if mean_contrast < 24: return "Vibrant"
        return "High Definition"
    except: return "Natural"

def calculate_dynamic_range(y):
    try:
        rms = np.sqrt(np.mean(y**2))
        peak = np.max(np.abs(y))
        if rms == 0: return 0.0
        crest_factor = 20 * np.log10(peak / rms)
        return float(round(crest_factor, 1))
    except: return 0.0

def heuristic_mood(bpm, key, energy, color):
    # Simple logic to guess mood
    is_minor = 'A' in key
    is_major = 'B' in key
    
    if energy == "High":
        if is_major: return "Euphoric"
        if is_minor: return "Aggressive"
    
    if energy == "Low":
        if is_major: return "Chill"
        if is_minor: return "Melancholic"
        
    if color == "Deep": return "Atmospheric"
    if color == "Bright": return "Playful"
    if is_minor: return "Groovy"
    
    return "Neutral"

def find_mix_points(y, sr, duration_sec):
    try:
        intro_end = "00:00"
        outro_start = "00:00"
        
        # Intro
        intro_dur = min(45, duration_sec / 4)
        y_intro = y[:int(intro_dur*sr)]
        rms_intro = librosa.feature.rms(y=y_intro)[0]
        if len(rms_intro) > 0:
            times = librosa.times_like(rms_intro, sr=sr)
            threshold = np.max(rms_intro) * 0.6
            jump_idx = np.where(rms_intro > threshold)[0]
            if len(jump_idx) > 0:
                intro_end = format_time(times[jump_idx[0]])

        # Outro
        outro_dur = min(45, duration_sec / 4)
        y_outro = y[-int(outro_dur*sr):]
        rms_outro = librosa.feature.rms(y=y_outro)[0]
        if len(rms_outro) > 0:
            times_outro = librosa.times_like(rms_outro, sr=sr)
            threshold_out = np.max(rms_outro) * 0.4
            loud_idx = np.where(rms_outro > threshold_out)[0]
            if len(loud_idx) > 0:
                last_loud = loud_idx[-1]
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
