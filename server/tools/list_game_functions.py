import json
import os


def walk(value, path, out):
    if isinstance(value, dict):
        if value.get("__fn__"):
            out.append((path, value.get("source", "")[:80]))
            return
        for key, val in value.items():
            walk(val, f"{path}.{key}" if path else key, out)
    elif isinstance(value, list):
        for idx, item in enumerate(value):
            walk(item, f"{path}[{idx}]", out)


def main():
    base_dir = os.path.dirname(__file__)
    raw_path = os.path.join(base_dir, "..", "game", "game_raw.json")
    with open(raw_path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    out = []
    walk(data, "", out)
    print(f"Function placeholders: {len(out)}")
    for path, preview in out[:50]:
        print(f"{path}: {preview}...")


if __name__ == "__main__":
    main()
