import json
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ProgressMessage:
    message: str
    percent: int
    type: str = "progress"

    def to_ndjson(self) -> str:
        return _to_ndjson(asdict(self))


@dataclass
class ErrorMessage:
    message: str
    type: str = "error"

    def to_ndjson(self) -> str:
        return _to_ndjson(asdict(self))


@dataclass
class MixPoints:
    intro_end: str
    outro_start: str
    drop: Optional[str]


@dataclass
class AnalysisResult:
    bpm: int
    key: str
    texture: str
    color: str
    loudness: float
    mix_points: MixPoints
    waveform: List[float]
    stems: Dict[str, List[float]]
    stem_files: Dict[str, str]
    midi_files: Dict[str, str]
    cues: List[Dict[str, Any]]
    meta: Dict[str, Any] = field(default_factory=dict)
    genre: str = ""

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["mix_points"] = asdict(self.mix_points)
        return data


def complete_message(result: AnalysisResult) -> str:
    return _to_ndjson({"type": "complete", "data": result.to_dict()})


def _to_ndjson(payload: Dict[str, Any]) -> str:
    return json.dumps(payload) + "\n"
