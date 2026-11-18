import { BOARD_COLUMNS, BOARD_ROWS } from "./grid";
/** Board-local points only. A right-edge crossing must never wrap to the next row. */
export function hitCell(
  x: number,
  y: number,
  width: number,
  height: number = width,
  columns: number = BOARD_COLUMNS,
): number | null {
  "worklet";
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    width <= 0 ||
    height <= 0 ||
    x < 0 ||
    y < 0 ||
    x >= width * columns ||
    y >= height * BOARD_ROWS
  )
    return null;
  return Math.floor(y / height) * columns + Math.floor(x / width);
}
