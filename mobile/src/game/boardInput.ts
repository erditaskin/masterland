/** Board-local points only. A right-edge crossing must never wrap to the next row. */
export function hitCell(
  x: number,
  y: number,
  width: number,
  height: number = width,
): number | null {
  "worklet";
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    width <= 0 ||
    height <= 0 ||
    x < 0 ||
    y < 0 ||
    x >= width * 6 ||
    y >= height * 9
  )
    return null;
  return Math.floor(y / height) * 6 + Math.floor(x / width);
}
