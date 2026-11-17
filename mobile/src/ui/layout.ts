/** One physical-pixel-aligned square pitch drives all 54 cells. */
export function fitSquareBoard(
  width: number,
  height: number,
  top: number,
  bottom: number,
  pixels: number,
) {
  const scale = width / 390;
  const navTop = height - bottom - 59;
  const frameInset = Math.round(7 * scale * pixels) / pixels;
  const cell =
    Math.floor(
      Math.min(
        (width - 24 * scale - 2 * frameInset) / 6,
        (navTop - 8 - top - 184 * scale - 2 * frameInset) / 9,
      ) * pixels,
    ) / pixels;
  const boardWidth = cell * 6 + frameInset * 2;
  return {
    cell,
    frameInset,
    boardWidth,
    boardTop: navTop - 8 - (cell * 9 + frameInset * 2),
    navTop,
  };
}

/** Fixed-size sections keep route cards readable as a city's achievement count grows. */
export function routeSections<T extends { id: string; city_id: string }>(
  stops: readonly { city_id: string }[],
  achievements: readonly T[],
) {
  return stops.flatMap((stop, region) => {
    const nodes = achievements.filter((a) => a.city_id === stop.city_id);
    return Array.from(
      { length: Math.max(1, Math.ceil(nodes.length / 4)) },
      (_, i) => ({
        id: stop.city_id + "-" + i,
        region,
        first: i === 0,
        nodes: nodes.slice(i * 4, i * 4 + 4),
      }),
    );
  });
}
