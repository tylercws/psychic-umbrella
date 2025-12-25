import logging
import os
import shutil
import subprocess
import sys
from typing import Dict, Optional, Tuple

import librosa
import numpy as np
from scipy import signal

logger = logging.getLogger(__name__)


class DemucsError(RuntimeError):
    """Raised when Demucs separation fails."""


def separate_audio_demucs(
    filepath: str,
    out_dir: str,
    model_name: str = "htdemucs_6s",
    timeout_seconds: int = 600,
) -> Dict[str, str]:
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    track_name = os.path.splitext(os.path.basename(filepath))[0]
    output_root = os.path.join(out_dir, "separated")
    cmd = [
        sys.executable,
        "-m",
        "demucs.separate",
        "-n",
        model_name,
        "-o",
        output_root,
        "--device",
        "cuda" if _has_cuda() else "cpu",
        filepath,
    ]

    logger.info("Running Demucs (%s) with timeout %ss: %s", model_name, timeout_seconds, " ".join(cmd))
    try:
        subprocess.run(cmd, check=True, timeout=timeout_seconds)
    except subprocess.TimeoutExpired as exc:
        raise DemucsError(f"Demucs timed out after {timeout_seconds}s") from exc
    except subprocess.CalledProcessError as exc:
        raise DemucsError(f"Demucs failed with exit code {exc.returncode}") from exc

    demucs_out_dir = os.path.join(output_root, model_name, track_name)
    stems: Dict[str, str] = {}
    target_dir = os.path.dirname(filepath)
    base_name = os.path.splitext(os.path.basename(filepath))[0]

    demucs_stems = ["vocals", "drums", "bass", "other", "piano", "guitar"]
    for d_stem in demucs_stems:
        src = os.path.join(demucs_out_dir, f"{d_stem}.wav")
        if os.path.exists(src):
            dst = os.path.join(target_dir, f"{base_name}_{d_stem}.wav")
            shutil.copy2(src, dst)
            stems[d_stem] = dst
        else:
            logger.warning("Demucs output missing expected stem %s for %s", d_stem, filepath)

    shutil.rmtree(demucs_out_dir, ignore_errors=True)
    return stems


def split_drums(y: np.ndarray, sr: int) -> Optional[Tuple[np.ndarray, np.ndarray]]:
    try:
        sos = signal.butter(4, 150, "lp", fs=sr, output="sos")
        kick = signal.sosfilt(sos, y)
        sos_hp = signal.butter(4, 150, "hp", fs=sr, output="sos")
        hats = signal.sosfilt(sos_hp, y)
        return kick, hats
    except Exception:
        logger.exception("Drum splitting failed")
        return None


def _has_cuda() -> bool:
    try:
        import torch

        return bool(torch.cuda.is_available())
    except Exception:
        return False
