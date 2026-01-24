import re
from typing import Any, Dict, Optional

from .function_placeholder import FunctionPlaceholder


class Parser:
    def __init__(self, verbs: Dict[str, dict], commands: Dict[str, dict]) -> None:
        self.verbs = verbs
        self.commands = commands
        self.override: Dict[str, dict] = {}

    def set_override(self, override: Optional[dict]) -> None:
        self.override = override or {}

    def parse(self, input_text: str) -> Any:
        command = self._parse(input_text, self.commands, True)
        if command is False:
            return self._parse(input_text, self.verbs, False)
        return command

    def _parse(self, input_text: str, source: Dict[str, dict], exact: bool) -> Any:
        override = (
            self.override.get("commands", {})
            if exact
            else self.override.get("verbs", {})
        )

        for key, source_obj in source.items():
            obj = dict(source_obj)
            override_obj = self._get_source(key, override)
            if override_obj:
                if callable(override_obj):
                    obj["callback"] = override_obj
                elif not isinstance(override_obj, dict):
                    obj["callback"] = override_obj
                else:
                    obj = {**source_obj, **override_obj}

            pattern = obj.get("pattern")
            if pattern is None:
                pattern = f"({key})"
            elif callable(pattern):
                pattern = pattern()
            elif isinstance(pattern, FunctionPlaceholder):
                pattern = pattern.source
            if not isinstance(pattern, str):
                continue
            if not pattern.startswith("("):
                pattern = f"({pattern})"

            if (
                source is not self.commands
                and override is not self.override.get("commands", {})
                and " " not in input_text
                and not obj.get("singolo", False)
            ):
                if re.match(f"^{pattern}$", input_text, re.IGNORECASE):
                    return input_text

            if not exact:
                if not obj.get("movimento") and not obj.get("complex"):
                    pattern += "(?:\\s+(.+))?" if obj.get("singolo") else "\\s+(.+)"

            regex = re.compile(f"^{pattern}$", re.IGNORECASE)
            matches = regex.match(input_text)
            if matches:
                subjects = []
                if obj.get("direzione") is not None:
                    subjects.append(obj["direzione"])
                else:
                    for group in matches.groups()[1:]:
                        if group is not None:
                            subjects.append(group.strip())

                return {
                    "verb": key,
                    "actionObject": obj,
                    "command": source is self.commands,
                    "subjects": subjects,
                }

        return False

    def _get_source(self, key: str, source: Dict[str, Any], separator: str = "|") -> Optional[Any]:
        for k, value in source.items():
            parts = k.split(separator)
            if key in parts:
                return value
        return None
