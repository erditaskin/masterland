/** Board-local points only. A right-edge crossing must never wrap to the next row. */
export function hitCell(x: number, y: number, size: number): number | null {
  "worklet";
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    size <= 0 ||
    x < 0 ||
    y < 0 ||
    x >= size * 6 ||
    y >= size * 9
  )
    return null;
  return Math.floor(y / size) * 6 + Math.floor(x / size);
}
