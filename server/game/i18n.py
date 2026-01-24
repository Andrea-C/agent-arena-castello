import json
import os
import re
from typing import Any, Dict

from .util import AttrDict


def _load_raw() -> Dict[str, Any]:
    base_dir = os.path.dirname(__file__)
    raw_path = os.path.join(base_dir, "i18n_raw.json")
    with open(raw_path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _make_callable(spec: Dict[str, Any]):
    args = spec.get("args", [])
    template = spec.get("template", "")

    def _render(*values):
        mapping = dict(zip(args, values))
        result = template
        for name, val in mapping.items():
            result = result.replace(f"${{{name}}}", str(val))
        return result

    return _render


def _convert(value: Any) -> Any:
    if isinstance(value, dict) and value.get("__fn__"):
        return _make_callable(value)
    if isinstance(value, dict):
        return {key: _convert(val) for key, val in value.items()}
    if isinstance(value, list):
        return [_convert(item) for item in value]
    return value


i18n = AttrDict(_convert(_load_raw()))
