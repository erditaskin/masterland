"""Copy the previous RN save to Masterland without modifying the source.

Run after installation, before the first normal launch. Review and QA sessions
never create a normal save. The app validates the imported schema before use.
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
    return Path(subprocess.check_output(
        ['xcrun', 'simctl', 'get_app_container', device, bundle, 'data'], text=True).strip())

source = container(args.source_device, 'com.erdi.ultima.rn') / 'Library/Application Support/com.erdi.ultima.rn/RCTAsyncLocalStorage_V1'
manifest = source / 'manifest.json'
before = manifest.read_bytes()
key = '@ultima/save/v2'
values = json.loads(before)
if key not in values:
    raise SystemExit('Previous RN save does not exist; nothing copied.')
raw = values[key]
if raw is None:
    raw = (source / hashlib.md5(key.encode()).hexdigest()).read_text()
value = json.loads(raw)
if value.get('schema') != 2:
    raise SystemExit('Unexpected source schema; nothing copied.')
target = container(args.target_device, 'com.erditaskin.masterland') / 'Documents/migration-v2.json'
if target.exists() and target.read_text() != raw:
    raise SystemExit('Existing import snapshot preserved; nothing copied.')
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(raw)
assert manifest.read_bytes() == before
print(json.dumps({'source_preserved': True, 'sha256': hashlib.sha256(raw.encode()).hexdigest(), 'xp': value['xp'], 'gold': value['gold'], 'gems': value['gems']}))
