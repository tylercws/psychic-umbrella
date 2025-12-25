import logging
import os
from typing import List, Optional

import librosa
import numpy as np

logger = logging.getLogger(__name__)


def generate_waveform(y: np.ndarray, points: int = 150) -> List[float]:
    hop_length = len(y) // points
    hop_length = max(hop_length, 1)

    waveform: List[float] = []
    for i in range(points):
        segment = y[i * hop_length : (i + 1) * hop_length]
        if len(segment) > 0:
            val = float(np.max(np.abs(segment)))
            waveform.append(val)
        else:
            waveform.append(0.0)

    max_val = max(waveform) if waveform else 0
    if max_val > 0:
        waveform = [float(round(v / max_val, 3)) for v in waveform]

    return waveform


def generate_midi_from_audio(audio_path: str, output_dir: str) -> Optional[str]:
    try:
        from basic_pitch.inference import predict_and_save

        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
        predict_and_save(
            audio_path_list=[audio_path],
            output_directory=output_dir,
            save_midi=True,
            save_model_outputs=False,
            save_notes=False,
        )
    except Exception:
        logger.exception("MIDI generation failed for %s", audio_path)
        return None

    base_name = os.path.splitext(os.path.basename(audio_path))[0]
    midi_path = os.path.join(output_dir, f"{base_name}_basic_pitch.mid")
    if os.path.exists(midi_path):
        return midi_path

    logger.warning("MIDI file not found after generation attempt for %s", audio_path)
    return None
