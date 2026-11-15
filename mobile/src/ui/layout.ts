/** Anchor one continuous, uniformly scaled background below the phone HUD.
 * Reference coordinates are measured from visual target v11, not guessed offsets.
 * Overscan is the minimum that keeps every screen edge covered after anchoring.
 */
export function fitBackdrop(width: number, height: number, hudTop: number) {
  const sourceWidth = 887,
    sourceHeight = 1774;
  const cover = Math.max(width / sourceWidth, height / sourceHeight);
  const baseX = (width - sourceWidth * cover) / 2 + 178 * cover;
  const baseY = (height - sourceHeight * cover) / 2 + 221 * cover;
  const targetX = ((175 - 25) * width) / 800;
  const targetY = hudTop + ((114 - 39) * width) / 800;
  const zoom =
    Math.max(
      1,
      targetX / baseX,
      (width - targetX) / (width - baseX),
      targetY / baseY,
      (height - targetY) / (height - baseY),
    ) + 0.002;
  return {
    width: width * zoom,
    height: height * zoom,
    left: targetX - baseX * zoom,
    top: targetY - baseY * zoom,
  };
}
