import json
import os
from typing import Any, Dict

from .function_placeholder import FunctionPlaceholder
from .util import AttrDict


def _convert(value: Any) -> Any:
    if isinstance(value, dict) and value.get("__fn__"):
        return FunctionPlaceholder(value.get("source", ""))
    if isinstance(value, dict):
        return AttrDict({key: _convert(val) for key, val in value.items()})
    if isinstance(value, list):
        return [_convert(item) for item in value]
    return value


def load_game_data() -> Dict[str, Any]:
    base_dir = os.path.dirname(__file__)
    raw_path = os.path.join(base_dir, "game_raw.json")
    with open(raw_path, "r", encoding="utf-8") as handle:
        raw = json.load(handle)
    return _convert(raw)
