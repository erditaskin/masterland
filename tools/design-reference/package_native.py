"""Package the independent scene graphs for the separate QA entry only."""
import hashlib
import json
import os
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "assets/references/device-v2"
OUT = ROOT / "mobile/qa/reference"
OUT.mkdir(parents=True, exist_ok=True)
assets = json.loads((SOURCE / "source-assets.json").read_text())
lines = ['// Generated design assets; never imported by mobile/index.js.', 'import type { ImageSourcePropType } from "react-native";', 'export const sources: Record<string, ImageSourcePropType> = {']
for key, digest in sorted(assets.items()):
    file = ROOT / key
    if hashlib.sha256(file.read_bytes()).hexdigest() != digest:
        raise ValueError("Frozen design asset changed: " + key)
    if key.startswith("assets/concepts/"):
        target = OUT / "inputs" / file.name
        target.parent.mkdir(exist_ok=True)
        shutil.copy2(file, target)
        file = target
    relative = os.path.relpath(file, OUT)
    lines.append('  ' + json.dumps(key) + ': require(' + json.dumps(relative if relative.startswith(".") else "./" + relative) + '),')
lines.append('};\n')
(OUT / "assets.ts").write_text("\n".join(lines))
scenes = {}
for file in sorted((SOURCE / "specs").glob("*.json")):
    scene = json.loads(file.read_text())
    for command in scene["commands"]:
        if command.get("file"):
            command["file"] = str(Path(command["file"]).relative_to(ROOT))
    scenes[scene["id"]] = scene
(OUT / "scenes.json").write_text(json.dumps(scenes, ensure_ascii=False, separators=(",", ":")) + "\n")
print(str(len(scenes)) + " QA-only reference scenes packaged")
