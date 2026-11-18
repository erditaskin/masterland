"""Extract unchanged pixels from the approved Belenyaka board, with provenance."""
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/concepts/city-refresh-v2/01-belenyaka-approval-v1.png'
OUT = ROOT / 'mobile/assets/art/approved-board-v1'
OUT.mkdir(parents=True, exist_ok=True)
regions = {
    'city1-cell': [278, 628, 355, 703],
    'city1-heading': [152, 279, 420, 330],
    'city1-filter-tr': [35, 283, 130, 331],
    'city1-frame': [31, 542, 523, 1226],
    'city1-producer-field': [64, 445, 140, 501],
    'city1-producer-mill': [157, 445, 231, 501],
    'city1-producer-oven': [250, 445, 324, 501],
    'city1-producer-barn': [343, 445, 417, 501],
    'city1-producer-orchard': [437, 445, 510, 501],
}

with Image.open(SOURCE) as image:
    for name, bounds in regions.items():
        image.crop(tuple(bounds)).save(OUT / (name + '.png'))
with Image.open(OUT / 'city1-frame.png') as frame:
    cap = 12
    widths, heights = [cap, frame.width - 2 * cap, cap], [cap, frame.height - 2 * cap, cap]
    for index in range(9):
        if index == 4:
            continue
        row, col = divmod(index, 3)
        x = [0, cap, frame.width - cap][col]
        y = [0, cap, frame.height - cap][row]
        frame.crop((x, y, x + widths[col], y + heights[row])).save(OUT / f'city1-frame-{index}.png')
manifest = {
    'source': str(SOURCE.relative_to(ROOT)),
    'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    'operation': 'lossless crop only; no redraw, color adjustment, or screenshot input',
    'regions_ltrb': regions,
    'frame_cap_source_pixels': 12,
    'layout': 'Native layout preserves the selected square-cell rule; artwork pixels come from the approved board.',
}
(OUT / 'provenance.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
