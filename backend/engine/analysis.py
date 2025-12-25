import logging
from typing import Dict, List, Optional, Tuple

import librosa
import numpy as np

logger = logging.getLogger(__name__)


def detect_bpm_and_key(y: np.ndarray, sr: int) -> Tuple[float, str]:
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo = librosa.beat.tempo(onset_envelope=onset_env, sr=sr)
    bpm = float(tempo[0]) if tempo.size else 0.0
    key = get_camelot_key(y, sr)
    return bpm, key


def analyze_texture_and_color(y: np.ndarray, sr: int) -> Tuple[str, str]:
    y_slice = y[: sr * 30]
    y_harm, y_perc = librosa.effects.hpss(y_slice)
    harm_energy = np.mean(librosa.feature.rms(y=y_harm))
    perc_energy = np.mean(librosa.feature.rms(y=y_perc))

    if perc_energy > harm_energy * 1.5:
        texture = "Rhythmic"
    elif harm_energy > perc_energy * 1.2:
        texture = "Melodic"
    else:
        texture = "Balanced"

    cent = librosa.feature.spectral_centroid(y=y_slice, sr=sr)
    avg_cent = np.mean(cent)

    if avg_cent < 1500:
        color = "Deep"
    elif avg_cent < 2500:
        color = "Warm"
    elif avg_cent < 3500:
        color = "Crisp"
    else:
        color = "Bright"

    return texture, color


def detect_drop(y: np.ndarray, sr: int) -> Optional[float]:
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    rms = librosa.feature.rms(y=y)[0]
    rms = librosa.util.fix_length(rms, size=len(onset_env))
    energy = onset_env * rms

    window_size = int(sr * 2.0 / 512)
    energy_smooth = np.convolve(energy, np.ones(window_size) / window_size, mode="same")

    skip_samples = int(30 * sr / 512)  # Skip first 30s (intro)
    if len(energy_smooth) <= skip_samples:
        return None

    valid_section = energy_smooth[skip_samples:]
    max_idx = int(np.argmax(valid_section)) + skip_samples
    times = librosa.times_like(onset_env, sr=sr)
    return float(times[max_idx])


def detect_cue_points(
    y: np.ndarray,
    y_harm: np.ndarray,
    sr: int,
    mix_points: Optional[Dict[str, str]] = None,
    drop_time: Optional[float] = None,
) -> List[Dict[str, object]]:
    cues: List[Dict[str, object]] = []

    rms_harm = librosa.feature.rms(
        y=y_harm, frame_length=2048, hop_length=512
    )[0]
    cent = librosa.feature.spectral_centroid(
        y=y_harm, sr=sr, n_fft=2048, hop_length=512
    )[0]

    if np.max(rms_harm) > 0:
        rms_norm = (rms_harm - np.min(rms_harm)) / (np.max(rms_harm) - np.min(rms_harm))
    else:
        rms_norm = rms_harm

    vocal_freq_weight = np.exp(-((cent - 1500) ** 2) / (2 * 1000**2))
    vocal_activity = rms_norm * vocal_freq_weight

    window_size = int(sr * 2.0 / 512)
    vocal_smooth = np.convolve(
        vocal_activity, np.ones(window_size) / window_size, mode="same"
    )

    is_vocal = vocal_smooth > 0.25
    times = librosa.times_like(vocal_activity, sr=sr)

    all_vocal_energy = vocal_smooth[is_vocal]
    avg_vocal_energy = float(np.mean(all_vocal_energy)) if len(all_vocal_energy) > 0 else 0

    current_start: Optional[float] = None
    for i, active in enumerate(is_vocal):
        if active and current_start is None:
            current_start = float(times[i])
        elif not active and current_start is not None:
            duration = float(times[i] - current_start)
            if duration > 4.0:
                section_energy = float(
                    np.mean(vocal_smooth[int(current_start * sr / 512) : int(times[i] * sr / 512)])
                )
                label = "VOCAL VERSE"
                if section_energy > avg_vocal_energy * 1.2:
                    label = "VOCAL CHORUS"
                elif section_energy < avg_vocal_energy * 0.8:
                    label = "VOCAL AD-LIB/BRIDGE"

                cues.append(
                    {
                        "id": f"vocal_{len(cues)}",
                        "label": label,
                        "time": format_time(current_start),
                        "startTime": current_start,
                        "endTime": float(times[i]),
                        "duration": round(duration, 1),
                        "type": "range",
                        "color": "#3b82f6" if "CHORUS" not in label else "#8b5cf6",
                    }
                )
            current_start = None

    if mix_points:
        if mix_points.get("intro_end") and mix_points["intro_end"] != "00:00":
            cues.append(
                {
                    "id": "intro",
                    "label": "INTRO END",
                    "time": mix_points["intro_end"],
                    "startTime": time_to_seconds_raw(mix_points["intro_end"]),
                    "type": "point",
                    "color": "#10b981",
                }
            )
        if mix_points.get("outro_start") and mix_points["outro_start"] != "00:00":
            cues.append(
                {
                    "id": "outro",
                    "label": "OUTRO START",
                    "time": mix_points["outro_start"],
                    "startTime": time_to_seconds_raw(mix_points["outro_start"]),
                    "type": "point",
                    "color": "#ef4444",
                }
            )

    if drop_time is not None:
        cues.append(
            {
                "id": "drop",
                "label": "DROP",
                "time": format_time(drop_time),
                "startTime": drop_time,
                "type": "point",
                "color": "#f59e0b",
            }
        )

    cues.sort(key=lambda x: x["startTime"])
    return cues


def find_mix_points(y: np.ndarray, sr: int, duration_sec: float) -> Tuple[str, str]:
    intro_end = "00:00"
    outro_start = "00:00"

    intro_dur = min(45, duration_sec / 4)
    y_intro = y[: int(intro_dur * sr)]
    rms_intro = librosa.feature.rms(y=y_intro)[0]
    if len(rms_intro) > 0:
        times = librosa.times_like(rms_intro, sr=sr)
        threshold = float(np.max(rms_intro) * 0.6)
        jump_idx = np.where(rms_intro > threshold)[0]
        if len(jump_idx) > 0:
            intro_end = format_time(float(times[jump_idx[0]]))

    outro_dur = min(45, duration_sec / 4)
    y_outro = y[-int(outro_dur * sr) :]
    rms_outro = librosa.feature.rms(y=y_outro)[0]
    if len(rms_outro) > 0:
        times_outro = librosa.times_like(rms_outro, sr=sr)
        threshold_out = float(np.max(rms_outro) * 0.4)
        loud_idx = np.where(rms_outro > threshold_out)[0]
        if len(loud_idx) > 0:
            last_loud = int(loud_idx[-1])
            start_offset = duration_sec - outro_dur
            abs_time = start_offset + float(times_outro[last_loud])
            outro_start = format_time(abs_time)

    return intro_end, outro_start


def get_camelot_key(y: np.ndarray, sr: int) -> str:
    came_lot_map = {
        "C": "8B",
        "Am": "8A",
        "G": "9B",
        "Em": "9A",
        "D": "10B",
        "Bm": "10A",
        "A": "11B",
        "F#m": "11A",
        "E": "12B",
        "C#m": "12A",
        "B": "1B",
        "G#m": "1A",
        "F#": "2B",
        "D#m": "2A",
        "Gb": "2B",
        "Ebm": "2A",
        "Db": "3B",
        "Bbm": "3A",
        "C#": "3B",
        "A#m": "3A",
        "Ab": "4B",
        "Fm": "4A",
        "G#": "4B",
        "Eb": "5B",
        "Cm": "5A",
        "D#": "5B",
        "Bb": "6B",
        "Gm": "6A",
        "A#": "6B",
        "F": "7B",
        "Dm": "7A",
    }

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_avg = np.mean(chroma, axis=1)
    maj_template = [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1]
    min_template = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0]
    maj_corrs = [np.corrcoef(chroma_avg, np.roll(maj_template, i))[0, 1] for i in range(12)]
    min_corrs = [np.corrcoef(chroma_avg, np.roll(min_template, i))[0, 1] for i in range(12)]
    notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    if np.max(maj_corrs) > np.max(min_corrs):
        root = notes[int(np.argmax(maj_corrs))]
        return came_lot_map.get(root, root)

    root = notes[int(np.argmax(min_corrs))]
    return came_lot_map.get(f"{root}m", f"{root}m")


def time_to_seconds_raw(t_str: str) -> int:
    minutes, seconds = map(int, t_str.split(":"))
    return minutes * 60 + seconds


def format_time(seconds: float) -> str:
    return f"{int(seconds // 60):02d}:{int(seconds % 60):02d}"


def detect_danceability(y: np.ndarray, sr: int, bpm: float) -> int:
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    pulse = librosa.beat.plp(onset_envelope=onset_env, sr=sr)
    beat_strength = np.mean(pulse)
    return min(100, int(beat_strength * 100 * 1.5))


def analyze_spectral_contrast(y: np.ndarray, sr: int) -> str:
    S = np.abs(librosa.stft(y))
    contrast = librosa.feature.spectral_contrast(S=S, sr=sr)
    mean_contrast = np.mean(contrast)

    if mean_contrast < 15:
        return "Flat"
    if mean_contrast < 20:
        return "Natural"
    if mean_contrast < 24:
        return "Vibrant"
    return "High Definition"


def calculate_dynamic_range(y: np.ndarray) -> float:
    rms = float(np.sqrt(np.mean(y**2)))
    peak = float(np.max(np.abs(y)))
    if rms == 0:
        return 0.0
    crest_factor = 20 * np.log10(peak / rms)
    return float(round(crest_factor, 1))


def heuristic_mood(bpm: float, key: str, energy: str, color: str) -> str:
    is_minor = "A" in key
    is_major = "B" in key

    if energy == "High":
        if is_major:
            return "Euphoric"
        if is_minor:
            return "Aggressive"

    if energy == "Low":
        if is_major:
            return "Chill"
        if is_minor:
            return "Melancholic"

    if color == "Deep":
        return "Atmospheric"
    if color == "Bright":
        return "Playful"
    if is_minor:
        return "Groovy"

    return "Neutral"


def guess_genre_by_bpm(bpm: float) -> str:
    if 60 <= bpm <= 90:
        return "Dub / Hip-Hop"
    if 90 < bpm <= 115:
        return "Mid-Tempo"
    if 115 < bpm <= 126:
        return "House / Disco"
    if 126 < bpm <= 138:
        return "Techno / Trance"
    if 138 < bpm <= 155:
        return "Dubstep / Trap"
    if 155 < bpm <= 180:
        return "Drum & Bass"
    return "Electronic"
