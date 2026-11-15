import { test } from "node:test";
import assert from "node:assert/strict";
import { fitSquareBoard, routeSections } from "../src/ui/layout";
test("square board uses one physical-pixel pitch and leaves controls outside all 54 cells", () => {
  for (const [width, height, top, bottom] of [
    [402, 874, 62, 34],
    [390, 844, 59, 34],
    [375, 812, 59, 34],
    [430, 932, 62, 34],
  ]) {
    const l = fitSquareBoard(width!, height!, top!, bottom!, 3);
    assert.ok(l.cell >= 44);
    assert.equal(Math.round(l.cell * 3), l.cell * 3);
    assert.ok(l.boardWidth <= width! - 16);
    assert.ok(l.boardTop >= top! + (176 * width!) / 390 - 0.5);
    assert.ok(l.boardTop + l.cell * 9 + 2 * l.frameInset < l.navTop);
  }
});

test("200 achievements extend one city route without shrinking or losing any nodes", () => {
  const nodes = Array.from({ length: 200 }, (_, i) => ({
    id: "a" + i,
    city_id: "city1",
  }));
  const sections = routeSections(
    [{ city_id: "city1" }, { city_id: "city2" }],
    nodes,
  );
  assert.equal(sections.length, 51);
  assert.ok(sections.every((s) => s.nodes.length <= 4));
  assert.deepEqual(
    sections.flatMap((s) => s.nodes).map((a) => a.id),
    nodes.map((a) => a.id),
  );
  assert.equal(sections.filter((s) => s.first).length, 2);
  assert.equal(sections.at(-1)!.region, 1);
});
