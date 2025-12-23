import os
import shutil
import time
from pathlib import Path
from typing import Iterable

from config import TEMP_FOLDER, TEMP_FILE_TTL_SECONDS, UPLOAD_FOLDER


def ensure_storage_dirs(directories: Iterable[str] | None = None) -> None:
    """
    Ensure required storage directories exist.

    Args:
        directories: Optional explicit list of directories. Defaults to upload/temp.
    """
    dirs = directories if directories is not None else [UPLOAD_FOLDER, TEMP_FOLDER]
    for folder in dirs:
        Path(folder).mkdir(parents=True, exist_ok=True)


def cleanup_temp_storage() -> None:
    """Remove the temporary audio directory on shutdown."""
    temp_path = Path(TEMP_FOLDER)
    if temp_path.exists():
        shutil.rmtree(temp_path)


def purge_old_temp_files() -> None:
    """Remove stale files from temp storage to keep disk usage bounded."""
    now = time.time()
    temp_path = Path(TEMP_FOLDER)
    if not temp_path.exists():
        return
    for entry in temp_path.iterdir():
        try:
            if entry.is_file():
                age = now - entry.stat().st_mtime
                if age > TEMP_FILE_TTL_SECONDS:
                    entry.unlink(missing_ok=True)
        except OSError:
            continue
