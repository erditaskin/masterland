import { BOARD_ROWS, boardColumns, usesStandardCityLayout } from "../game/grid";
import { belenyakaLayout, belenyakaRect } from "./belenyakaLayout";
import referenceLayout from "../../../data/ui-reference-layout.json";

/** One measured base; city overrides can change metrics without changing game rules. */
export function referenceMetrics(cityID: string) {
  const override = (
    referenceLayout.cities as Record<
      string,
      { board_cell_pitch?: number[]; producer_tile?: number[] }
    >
  )[cityID];
  return {
    cell: override?.board_cell_pitch ?? referenceLayout.base.board_cell_pitch,
    producer: override?.producer_tile ?? referenceLayout.base.producer_tile,
  };
}

/** Enlarge the hit target around the unchanged painted face, in device points. */
export function centeredHitRect(
  rect: readonly [number, number, number, number],
  scale: number,
  minimumPoints = 44,
): readonly [number, number, number, number] {
  const [x, y, width, height] = rect;
  const hitWidth = Math.max(width, minimumPoints / scale);
  const hitHeight = Math.max(height, minimumPoints / scale);
  return [
    x - (hitWidth - width) / 2,
    y - (hitHeight - height) / 2,
    hitWidth,
    hitHeight,
  ];
}

/** One physical-pixel-aligned square pitch drives all 54 cells. */
export function fitSquareBoard(
  width: number,
  height: number,
  top: number,
  bottom: number,
  pixels: number,
) {
  const scale = width / 1206;
  const navTop = height - bottom - 160 * scale;
  const frameInset = Math.round(24 * scale * pixels) / pixels;
  const cell =
    Math.floor(
      Math.min(
        164 * scale,
        (navTop -
          36 * scale -
          Math.max(800 * scale, top + 180 * scale) -
          2 * frameInset) /
          9,
      ) * pixels,
    ) / pixels;
  const boardWidth = cell * 6 + frameInset * 2;
  return {
    cell,
    frameInset,
    boardWidth,
    boardTop: navTop - 36 * scale - (cell * 9 + frameInset * 2),
    navTop,
  };
}

/** Positions come from the immutable approved drawing; native hit regions remain independent. */
export function approvedDesignRect(
  rect: readonly number[],
  width: number,
  height: number,
): readonly [number, number, number, number] {
  const source = referenceLayout.approved_device_design.source_size;
  return [
    (rect[0]! * 1206) / source[0]!,
    (rect[1]! * height * 1206) / (source[1]! * width),
    (rect[2]! * 1206) / source[0]!,
    (rect[3]! * height * 1206) / (source[1]! * width),
  ];
}
export const approvedLayout = referenceLayout.approved_device_design;

export function referenceNavigationRect(
  width: number,
  height: number,
  bottom: number,
  cityID: string,
  rect: readonly number[] = approvedLayout.navigation,
): ReturnType<typeof approvedDesignRect> {
  if (!usesStandardCityLayout(cityID))
    return approvedDesignRect(rect, width, height);
  const [left, top, navWidth, navHeight] = belenyakaRect(
    belenyakaLayout.navigation,
    width,
    height,
  );
  const scale = width / 1206;
  return [
    left,
    Math.min(
      top,
      (height - (bottom > 0 ? Math.max(13, bottom - 21) : 0)) / scale -
        navHeight,
    ),
    navWidth,
    navHeight,
  ];
}

export function fitReferenceBoard(
  width: number,
  height: number,
  top: number,
  bottom: number,
  pixels: number,
  cityID = "city1",
  columns = boardColumns(cityID),
) {
  const scale = width / 1206;
  const city = (
    referenceLayout.cities as Record<
      string,
      { device_board?: number[]; device_navigation?: number[] }
    >
  )[cityID];
  const box = approvedDesignRect(
    city?.device_board ?? approvedLayout.board,
    width,
    height,
  );
  const nav = referenceNavigationRect(
    width,
    height,
    bottom,
    cityID,
    city?.device_navigation,
  );
  const frameInset =
    Math.round(
      ((approvedLayout.frame_inset_source * width) /
        approvedLayout.source_size[0]!) *
        pixels,
    ) / pixels;
  if (usesStandardCityLayout(cityID)) {
    const [, y] = belenyakaRect(belenyakaLayout.board, width, height);
    const [x, panelTop, w, panelHeight] = belenyakaRect(
      belenyakaLayout.upperPanel,
      width,
      height,
    );
    const inset = Math.round(21 * scale * pixels) / pixels;
    const boardWidth = w * scale;
    const cellWidth = (boardWidth - 2 * inset) / columns;
    const boardTop = Math.round(y * scale * pixels) / pixels;
    const topGap = Math.max(0, boardTop - (panelTop + panelHeight) * scale);
    const boardHeight = nav[1] * scale - topGap - boardTop;
    const cellHeight = (boardHeight - 2 * inset) / BOARD_ROWS;
    return {
      cell: cellWidth,
      cellWidth,
      cellHeight,
      frameInset: inset,
      boardWidth,
      boardLeft: x * scale,
      boardTop,
      producerOffset: 0,
      navTop: nav[1] * scale,
      navHeight: nav[3] * scale,
    };
  }
  const horizontalCell =
    Math.floor(((box[2] * scale - 2 * frameInset) / columns) * pixels) / pixels;
  const navTop = nav[1] * scale;
  const bottomClearance = Math.min(bottom, 8 * scale);
  const shelf = approvedDesignRect(
    approvedLayout.producer_shelf,
    width,
    height,
  );
  const rail = approvedDesignRect(approvedLayout.orders, width, height);
  const minimumGap = 3;
  const shelfEnd = (shelf[1] + shelf[3]) * scale;
  const maximumLift = Math.max(
    0,
    shelf[1] * scale - (rail[1] + rail[3]) * scale - minimumGap,
  );
  const preferredTop =
    navTop - bottomClearance - (horizontalCell * BOARD_ROWS + 2 * frameInset);
  const lift = Math.min(
    maximumLift,
    Math.max(0, shelfEnd + minimumGap - preferredTop),
  );
  const headerEnd = Math.max(top + 120 * scale, shelfEnd - lift);
  const verticalCell =
    Math.floor(
      ((navTop - bottomClearance - headerEnd - minimumGap - 2 * frameInset) /
        BOARD_ROWS) *
        pixels,
    ) / pixels;
  const cellWidth = Math.min(horizontalCell, verticalCell);
  const cellHeight = cellWidth;
  const fittedTop = Math.max(
    headerEnd + minimumGap,
    Math.min(
      box[1] * scale,
      navTop - bottomClearance - (BOARD_ROWS * cellHeight + 2 * frameInset),
    ),
  );
  // The shared geometry does not change progress or unlock a themed city.
  return {
    cell: cellWidth,
    cellWidth,
    cellHeight,
    frameInset,
    boardWidth: cellWidth * columns + 2 * frameInset,
    boardTop: Math.round(fittedTop * pixels) / pixels,
    boardLeft:
      Math.round(
        ((width - (cellWidth * columns + 2 * frameInset)) / 2) * pixels,
      ) / pixels,
    producerOffset: -lift,
    navTop,
    navHeight: nav[3] * scale,
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
