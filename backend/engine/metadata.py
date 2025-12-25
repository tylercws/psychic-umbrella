import logging
import os
import re
from typing import Dict

import requests

logger = logging.getLogger(__name__)

MUSICBRAINZ_ENDPOINT = "https://musicbrainz.org/ws/2/recording"
USER_AGENT = "GeminiDJ/2.0 (contact@gemini.com)"


def fetch_metadata_rich(filename: str, timeout_seconds: int = 10) -> Dict[str, str]:
    query = clean_filename_str(os.path.splitext(filename)[0])
    params = {"query": query, "fmt": "json", "limit": 1}
    headers = {"User-Agent": USER_AGENT}

    try:
        response = requests.get(
            MUSICBRAINZ_ENDPOINT,
            params=params,
            headers=headers,
            timeout=timeout_seconds,
        )
        response.raise_for_status()
        payload = response.json()
    except requests.RequestException as exc:
        logger.warning("Metadata lookup failed for %s: %s", filename, exc)
        return {}
    except ValueError as exc:
        logger.warning("Metadata response could not be decoded for %s: %s", filename, exc)
        return {}

    recordings = payload.get("recordings") or payload.get("recording-list") or []
    if not recordings:
        return {}

    recording = recordings[0]
    meta: Dict[str, str] = {
        "artist": _safe_lookup(recording, ["artist-credit", 0, "artist", "name"], default=""),
        "title": recording.get("title", ""),
        "year": recording.get("date", "")[:4] if recording.get("date") else "",
    }

    releases = recording.get("releases") or recording.get("release-list") or []
    if releases:
        release_id = releases[0].get("id")
        if release_id:
            meta["release_id"] = release_id
            meta["cover_art_url"] = f"http://coverartarchive.org/release/{release_id}/front"

    return meta


def clean_filename_str(raw: str) -> str:
    sanitized = re.sub(r"[\\\\/*?:\\\"<>|]", "", raw)
    sanitized = re.sub(r"\\(Official.*?\\)", "", sanitized, flags=re.IGNORECASE)
    sanitized = re.sub(r"\\[Official.*?]", "", sanitized, flags=re.IGNORECASE)
    sanitized = sanitized.replace("_", " ")
    return sanitized.strip()


def _safe_lookup(payload: dict, path: list, default: str = "") -> str:
    current = payload
    try:
        for part in path:
            current = current[part]
        return str(current)
    except (KeyError, IndexError, TypeError):
        return default
