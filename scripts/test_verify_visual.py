"""The acceptance gate must reject absent, resized and even one-pixel-changed evidence."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

from PIL import Image

spec = importlib.util.spec_from_file_location("verify_visual", Path(__file__).with_name("verify-visual.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class VisualGateTests(unittest.TestCase):
    def test_strict_acceptance_and_failure_cases(self):
        with tempfile.TemporaryDirectory() as directory:
            a, b = Path(directory) / "reference.png", Path(directory) / "actual.png"
            self.assertEqual(module.compare(a, b)["status"], "missing-evidence")
            Image.new("RGBA", (4, 4), "white").save(a)
            Image.new("RGBA", (4, 4), "white").save(b)
            self.assertEqual(module.compare(a, b)["status"], "passed")
            changed = Image.open(b)
            changed.putpixel((3, 3), (255, 255, 254, 255))
            changed.save(b)
            result = module.compare(a, b)
            self.assertEqual(result["status"], "pixel-mismatch")
            self.assertEqual(result["different_pixels"], 1)
            Image.new("RGBA", (4, 5), "white").save(b)
            self.assertEqual(module.compare(a, b)["status"], "size-mismatch")


if __name__ == "__main__":
    unittest.main()
