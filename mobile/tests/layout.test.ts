import { test } from "node:test";
import assert from "node:assert/strict";
import { belenyakaLayout } from "../src/ui/belenyakaLayout";
import {
  centeredHitRect,
  fitReferenceBoard,
  fitSquareBoard,
  routeSections,
} from "../src/ui/layout";
test("approved viewport keeps the board near both edges with a uniform physical pitch", () => {
  for (const [width, height, top, bottom] of [
    [402, 874, 62, 34],
    [390, 844, 59, 34],
    [430, 932, 62, 34],
  ]) {
    const layout = fitReferenceBoard(width!, height!, top!, bottom!, 3);
    assert.ok((width! - layout.boardWidth) / 2 < width! * 0.085);
    assert.ok(Math.abs(layout.boardLeft - width! * (27 / 1206)) < 1e-9);
    assert.ok(Math.abs(layout.boardWidth - width! * (1152 / 1206)) < 1e-9);
    assert.equal(layout.boardTop * 3, Math.round(layout.boardTop * 3));
    assert.ok(layout.boardWidth <= width!);
    const previousLayout = fitReferenceBoard(
      width!,
      height!,
      top!,
      bottom!,
      3,
      "city1",
      7,
    );
    assert.ok(
      Math.abs(6 * layout.cellWidth - 7 * previousLayout.cellWidth) < 1e-9,
    );
    assert.equal(layout.boardWidth, previousLayout.boardWidth);
    assert.equal(layout.boardTop, previousLayout.boardTop);
    assert.equal(layout.cellHeight, previousLayout.cellHeight);
    const [, panelTop, , panelHeight] = belenyakaLayout.upperPanel;
    const topGap =
      layout.boardTop - ((panelTop! + panelHeight!) * height!) / 2622;
    const bottomGap =
      layout.navTop -
      (layout.boardTop + 9 * layout.cellHeight + 2 * layout.frameInset);
    assert.ok(Math.abs(topGap - bottomGap) < 1e-9);
    assert.ok(
      layout.cellHeight > ((1423 * height!) / 2622 - 2 * layout.frameInset) / 9,
    );
    assert.ok(layout.boardTop > top!);
    assert.ok(
      layout.boardTop + 9 * layout.cellHeight + 2 * layout.frameInset <
        layout.navTop,
    );
    assert.ok(layout.navTop + layout.navHeight <= height!);
    assert.ok(
      height! - (layout.navTop + layout.navHeight) >=
        Math.max(13, bottom! - 21) - 0.001,
    );
  }
});
test("touch targets expand without moving the painted center at supported widths", () => {
  for (const width of [320, 402, 430]) {
    const scale = width / 1206;
    const face = [100, 200, 72, 72] as const;
    const hit = centeredHitRect(face, scale);
    assert.ok(hit[2] * scale >= 44);
    assert.ok(hit[3] * scale >= 44);
    assert.equal(hit[0] + hit[2] / 2, face[0] + face[2] / 2);
    assert.equal(hit[1] + hit[3] / 2, face[1] + face[3] / 2);
    const large = [90, 200, 1026, 220] as const;
    assert.deepEqual(centeredHitRect(large, scale), large);
  }
});
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
