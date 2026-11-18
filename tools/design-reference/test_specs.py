"""Regression checks for independently authored device targets, before native capture."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SET = ROOT / "assets/references/device-v2"


class DesignTargets(unittest.TestCase):
    def scene(self, name):
        return json.loads((SET / "specs" / (name + ".json")).read_text())

    def test_deletion_is_not_a_guest_account_page(self):
        commands = self.scene("city1-account-deletion")["commands"]
        text = [c["text"] for c in commands if c["kind"] == "text"]
        self.assertTrue(any("Bu işlem geri alınamaz" in line for line in text))
        self.assertIn("Kalıcı olarak sil", text)
        self.assertNotIn("Hesapsız oynuyorsun", text)
        self.assertFalse(any(c["kind"] == "native-apple" for c in commands))

    def test_navigation_and_action_are_separate_material_roles(self):
        palette = json.loads((SET / "palettes.json").read_text())["city1"]
        self.assertNotEqual(palette["navSelected"], palette["primary"])
        self.assertEqual(palette["navSelected"], "#df9c24")

    def test_exact_viewport_and_no_application_screenshot_inputs(self):
        files = list((SET / "specs").glob("*.json"))
        self.assertEqual(len(files), 26)
        for path in files:
            scene = json.loads(path.read_text())
            self.assertEqual((scene["width"], scene["height"]), (1206, 2622))
        for path in json.loads((SET / "source-assets.json").read_text()):
            self.assertTrue(path.startswith(("assets/concepts/", "mobile/assets/")))
            self.assertNotIn("verification", path)


if __name__ == "__main__":
    unittest.main()
