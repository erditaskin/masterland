#!/usr/bin/env python3
"""Strict device screenshot gate: no baseline creation, resizing, masks or tolerance."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops


def compare(expected: Path, actual: Path) -> dict:
    if not expected.is_file() or not actual.is_file():
        return {"status": "missing-evidence", "expected_exists": expected.is_file(), "actual_exists": actual.is_file()}
    with Image.open(expected) as reference, Image.open(actual) as screenshot:
        if reference.size != screenshot.size:
            return {"status": "size-mismatch", "expected_size": reference.size, "actual_size": screenshot.size}
        for key in ("icc_profile", "srgb", "gamma"):
            if reference.info.get(key) != screenshot.info.get(key):
                return {"status": "color-profile-mismatch", "metadata": key}
        a, b = reference.convert("RGBA"), screenshot.convert("RGBA")
        # Count a pixel once even if more than one of its channels differs.
        changed = sum(pixel != (0, 0, 0, 0) for pixel in ImageChops.difference(a, b).getdata())
        total = a.width * a.height
        return {"status": "passed" if changed == 0 else "pixel-mismatch", "different_pixels": changed,
                "total_pixels": total, "identical_percent": 100 * (total - changed) / total,
                "expected_sha256": hashlib.sha256(expected.read_bytes()).hexdigest(),
                "actual_sha256": hashlib.sha256(actual.read_bytes()).hexdigest()}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    base = args.manifest.parent
    results = []
    for case in manifest["cases"]:
        if not case.get("reference_approved"):
            result = {"status": "reference-awaiting-approval"}
        else:
            result = compare(base / case["expected"], base / case["actual"])
        results.append({"id": case["id"], **result})
    passed = bool(results) and all(r["status"] == "passed" for r in results)
    report = {"status": "passed" if passed else "not-accepted", "policy": "zero-different-pixels; same dimensions and color metadata; no masks or rescaling", "cases": results}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"status": report["status"], "passed": sum(r["status"] == "passed" for r in results), "total": len(results)}))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
