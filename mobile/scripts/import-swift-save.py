"""Copy the existing Swift prototype save into the RN app's one-time import slot.

Both apps must be installed. The original file is never edited. The RN loader
imports only when its own v2 save does not yet exist. Run before first normal
launch; review and QA sessions do not create a normal save.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--source-device', required=True)
parser.add_argument('--target-device', required=True)
args = parser.parse_args()

def container(device, bundle):
    return Path(subprocess.check_output(['xcrun', 'simctl', 'get_app_container', device, bundle, 'data'], text=True).strip())

source = container(args.source_device, 'com.erdi.ultima.prototype') / 'Library/Application Support/ultima/save-v1.json'
target = container(args.target_device, 'com.erditaskin.masterland') / 'Documents/legacy-save.json'
raw = source.read_bytes()
value = json.loads(raw)
if value.get('schema') != 1 or len(value['cities'][value['cityID']]['board']) != 54:
    raise SystemExit('Source save is invalid; nothing copied.')
if target.exists() and target.read_bytes() != raw:
    raise SystemExit('An import snapshot already exists; it was preserved.')
target.parent.mkdir(parents=True, exist_ok=True)
target.write_bytes(raw)
assert target.read_bytes() == source.read_bytes()
print(json.dumps({'source_preserved': True, 'sha256': hashlib.sha256(raw).hexdigest(), 'xp': value['xp'], 'gold': value['gold'], 'gems': value['gems']}, ensure_ascii=False))
