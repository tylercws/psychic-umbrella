import logging
import os
from typing import Dict, Generator, List

import librosa
import soundfile as sf

from . import analysis
from .types import AnalysisResult, ErrorMessage, MixPoints, ProgressMessage, complete_message
from .metadata import fetch_metadata_rich
from .rendering import generate_midi_from_audio, generate_waveform
from .separation import DemucsError, separate_audio_demucs, split_drums

logger = logging.getLogger(__name__)


def analyze_audio(filepath: str, model_name: str = "htdemucs_6s") -> Generator[str, None, None]:
    logger.info("Starting analysis for %s with model %s", filepath, model_name)

    try:
        yield ProgressMessage(message="Loading audio file...", percent=5).to_ndjson()
        y, sr = librosa.load(filepath, duration=180)
        total_duration = librosa.get_duration(y=y, sr=sr)
    except Exception as exc:
        logger.exception("Failed to load audio file %s", filepath)
        yield ErrorMessage(message=f"Audio load failed: {exc}").to_ndjson()
        return

    try:
        yield ProgressMessage(message="Detecting BPM & Key...", percent=10).to_ndjson()
        bpm, key = analysis.detect_bpm_and_key(y, sr)
    except Exception as exc:
        logger.exception("BPM/Key detection failed for %s", filepath)
        yield ErrorMessage(message=f"BPM/Key detection failed: {exc}").to_ndjson()
        return

    yield ProgressMessage(message="Fetching metadata...", percent=20).to_ndjson()
    filename = os.path.basename(filepath)
    meta: Dict[str, str] = {}
    try:
        meta = fetch_metadata_rich(filename)
    except Exception as exc:
        logger.warning("Metadata fetch failed for %s: %s", filename, exc)
    meta["filename"] = filename

    yield ProgressMessage(message=f"Separating ({model_name})...", percent=30).to_ndjson()
    try:
        demucs_cache_dir = os.path.join(os.path.dirname(filepath), "temp_audio")
        stems_dict = separate_audio_demucs(
            filepath,
            demucs_cache_dir,
            model_name=model_name,
        )
    except DemucsError as exc:
        logger.exception("Demucs separation failed for %s", filepath)
        yield ErrorMessage(message=f"Stem separation failed: {exc}").to_ndjson()
        return

    yield ProgressMessage(message="Splitting Drums (Kick/Hats)...", percent=70).to_ndjson()
    if "drums" in stems_dict:
        try:
            drum_y, _ = librosa.load(stems_dict["drums"], sr=sr)
            drum_split = split_drums(drum_y, sr)
            if drum_split:
                kick_y, hats_y = drum_split
                base_name = os.path.splitext(filepath)[0]
                kick_path = f"{base_name}_kick.wav"
                hats_path = f"{base_name}_hats.wav"
                sf.write(kick_path, kick_y, sr)
                sf.write(hats_path, hats_y, sr)
                stems_dict["kick"] = kick_path
                stems_dict["hats"] = hats_path
        except Exception:
            logger.exception("Drum splitting failed for %s", stems_dict.get("drums"))

    yield ProgressMessage(message="Generating Waveforms...", percent=80).to_ndjson()
    try:
        y_full, _ = librosa.load(filepath, sr=sr)
    except Exception as exc:
        logger.exception("Failed to load full audio for waveform generation for %s", filepath)
        yield ErrorMessage(message=f"Waveform generation failed: {exc}").to_ndjson()
        return

    def _waveform_for_path(path: str) -> List[float]:
        try:
            y_stem, _ = librosa.load(path, sr=sr)
            return generate_waveform(y_stem)
        except Exception:
            logger.exception("Waveform generation failed for %s", path)
            return [0.0] * 150

    waveform = generate_waveform(y_full)
    stem_waveforms: Dict[str, List[float]] = {}
    if "vocals" in stems_dict:
        stem_waveforms["vocal"] = _waveform_for_path(stems_dict["vocals"])
    if "bass" in stems_dict:
        stem_waveforms["bass"] = _waveform_for_path(stems_dict["bass"])
    if "kick" in stems_dict:
        stem_waveforms["kick"] = _waveform_for_path(stems_dict["kick"])
    if "hats" in stems_dict:
        stem_waveforms["hihats"] = _waveform_for_path(stems_dict["hats"])
    if "piano" in stems_dict:
        stem_waveforms["piano"] = _waveform_for_path(stems_dict["piano"])
    if "guitar" in stems_dict:
        stem_waveforms["guitar"] = _waveform_for_path(stems_dict["guitar"])
    if "other" in stems_dict:
        stem_waveforms["other"] = _waveform_for_path(stems_dict["other"])

    yield ProgressMessage(message="Final Analysis...", percent=90).to_ndjson()
    try:
        texture, color = analysis.analyze_texture_and_color(y, sr)
        drop_time = analysis.detect_drop(y, sr)
        intro_end, outro_start = analysis.find_mix_points(y_full, sr, total_duration)
    except Exception as exc:
        logger.exception("High-level analysis failed for %s", filepath)
        yield ErrorMessage(message=f"Analysis failed: {exc}").to_ndjson()
        return

    mix_points_dict = {
        "intro_end": intro_end,
        "outro_start": outro_start,
    }
    mix_points = MixPoints(
        intro_end=intro_end,
        outro_start=outro_start,
        drop=analysis.format_time(drop_time) if drop_time else None,
    )

    cues: List[Dict[str, object]] = []
    try:
        if "vocals" in stems_dict:
            y_voc, _ = librosa.load(stems_dict["vocals"], sr=sr)
            cues = analysis.detect_cue_points(y_full, y_voc, sr, mix_points_dict, drop_time)
        else:
            y_harm, _ = librosa.effects.hpss(y_full)
            cues = analysis.detect_cue_points(y_full, y_harm, sr, mix_points_dict, drop_time)
    except Exception:
        logger.exception("Cue detection failed for %s", filepath)

    midi_files: Dict[str, str] = {}
    melodic_stems = ["piano", "guitar", "bass"]
    for stem_name in melodic_stems:
        stem_path = stems_dict.get(stem_name)
        if stem_path and os.path.exists(stem_path):
            yield ProgressMessage(
                message=f"Transcribing MIDI: {stem_name.upper()}...", percent=90
            ).to_ndjson()
            try:
                midi_path = generate_midi_from_audio(stem_path, os.path.dirname(filepath))
                if midi_path:
                    midi_files[stem_name] = os.path.basename(midi_path)
            except Exception:
                logger.exception("MIDI transcription failed for %s", stem_path)

    result = AnalysisResult(
        bpm=int(round(bpm)),
        key=key,
        texture=texture,
        color=color,
        loudness=-14.0,
        mix_points=mix_points,
        waveform=waveform,
        stems=stem_waveforms,
        stem_files={
            "main": os.path.basename(filepath),
            "vocal": os.path.basename(stems_dict.get("vocals", "")),
            "bass": os.path.basename(stems_dict.get("bass", "")),
            "kick": os.path.basename(stems_dict.get("kick", "")),
            "hihats": os.path.basename(stems_dict.get("hats", "")),
            "piano": os.path.basename(stems_dict.get("piano", "")),
            "guitar": os.path.basename(stems_dict.get("guitar", "")),
            "other": os.path.basename(stems_dict.get("other", "")),
        },
        midi_files=midi_files,
        cues=cues,
        meta=meta,
        genre=f"{texture} {color}",
    )

    yield complete_message(result)
