import { test } from "node:test";
import assert from "node:assert/strict";
import { fitBackdrop } from "../src/ui/layout";
test("continuous backdrop covers every edge without changing its aspect ratio", () => {
  for (const [width, height, hudTop] of [
    [390, 844, 39],
    [402, 874, 54],
    [375, 812, 39],
    [430, 932, 54],
  ] as const) {
    const f = fitBackdrop(width, height, hudTop);
    assert.ok(f.left <= 0 && f.top <= 0);
    assert.ok(f.left + f.width >= width && f.top + f.height >= height);
    assert.ok(Math.abs(f.width / f.height - width / height) < 1e-10);
  }
});
