"""Assert that production art slices preserve original approved source pixels."""
import hashlib
import json
import unittest
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'mobile/assets/art/approved-board-v1'

class ApprovedSourcePixels(unittest.TestCase):
    def test_every_region_is_an_unchanged_source_crop(self):
        manifest = json.loads((ART / 'provenance.json').read_text())
        source = ROOT / manifest['source']
        self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(), manifest['source_sha256'])
        with Image.open(source) as original:
            for name, bounds in manifest['regions_ltrb'].items():
                with self.subTest(region=name), Image.open(ART / (name + '.png')) as actual:
                    expected = original.crop(tuple(bounds)).convert('RGBA')
                    self.assertEqual(actual.size, expected.size)
                    self.assertEqual(actual.convert('RGBA').tobytes(), expected.tobytes())

    def test_frame_slices_have_no_invented_pixels(self):
        with Image.open(ART / 'city1-frame.png') as frame:
            cap = 12
            widths = [cap, frame.width - 2 * cap, cap]
            heights = [cap, frame.height - 2 * cap, cap]
            for index in range(9):
                if index == 4:
                    continue
                row, col = divmod(index, 3)
                x, y = [0, cap, frame.width - cap][col], [0, cap, frame.height - cap][row]
                expected = frame.crop((x, y, x + widths[col], y + heights[row])).convert('RGBA')
                with self.subTest(slice=index), Image.open(ART / f'city1-frame-{index}.png') as actual:
                    self.assertEqual(actual.size, expected.size)
                    self.assertEqual(actual.convert('RGBA').tobytes(), expected.tobytes())

if __name__ == '__main__':
    unittest.main()
